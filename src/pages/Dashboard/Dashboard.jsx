import React from 'react'
import styles from './Dashboard.module.css'
import { Chart as ChartJS } from 'chart.js/auto'
import { Bar, Chart, Doughnut, Line } from 'react-chartjs-2'
import ButtonType from '../../components/Atoms/ButtonType/ButtonType'
import { useEffect, useState } from 'react'
import { API_URL } from '../../config/api'
import useAuth from '../../hooks/useAuth'
import { CaretDown } from 'phosphor-react'
import { jsPDF } from 'jspdf'
import * as XLSX from "xlsx"
import autoTable from 'jspdf-autotable'

// Função utilitária para converter imagem de URL para base64
async function getBase64FromUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Função utilitária para garantir espaço na página
function getStartY(doc, minY = 30) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const lastY = doc.lastAutoTable?.finalY || 0;
  // Se o espaço restante for menor que 60, começa na próxima página
  if (pageHeight - lastY < 60) {
    doc.addPage();
    return minY;
  }
  return lastY + 15;
}

const Dashboard = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [showReportOptions, setShowReportOptions] = useState(false)
    const [stats, setStats] = useState({
        totalPets: 0,
        totalAdopters: 0,
        extremeSituation: 0,
        specialPets: 0,
        vaccinatedPets: 0,
        adoptedPets: 0,
        petsByType: {},
        petsByAge: {},
        petsByStatus: {},
        monthlyAdoptions: {
            approved: Array(12).fill(0),
            rejected: Array(12).fill(0),
            completed: Array(12).fill(0)
        },
        monthlyRescues: Array(12).fill(0)
    })
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token")
                
                // Buscar pets
                const petsResponse = await fetch(`${API_URL}/pets/by-ong/${user._id}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                })
                const pets = await petsResponse.json()

                // Buscar adoções
                const adoptionsResponse = await fetch(`${API_URL}/adoptions/by-ong/${user._id}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                })
                const adoptionsData = await adoptionsResponse.json()
                const adoptions = adoptionsData.adoptions || []

                // Descobrir anos disponíveis
                const yearsSet = new Set();
                pets.forEach(pet => {
                    if (pet.registerDate) yearsSet.add(new Date(pet.registerDate).getFullYear());
                });
                adoptions.forEach(adoption => {
                    if (adoption.requestDate) yearsSet.add(new Date(adoption.requestDate).getFullYear());
                });
                const yearsArr = Array.from(yearsSet).sort((a, b) => b - a);
                setAvailableYears(yearsArr.length ? yearsArr : [new Date().getFullYear()]);
                if (!yearsArr.includes(selectedYear)) setSelectedYear(yearsArr[0] || new Date().getFullYear());

                // Processar estatísticas filtrando pelo ano selecionado
                const newStats = {
                    totalPets: pets.length,
                    totalAdopters: 0, // Será atualizado quando implementarmos a API de adotantes
                    castratedPets: pets.filter(pet => pet.health?.castrated).length,
                    dewormedPets: pets.filter(pet => pet.health?.dewormed).length,
                    extremeSituation: pets.filter(pet => {
                        const conditions = pet.health?.specialCondition;
                        if (Array.isArray(conditions)) {
                            return conditions.some(condition => condition.toLowerCase().includes('extrema'));
                        }
                        return conditions?.toLowerCase().includes('extrema');
                    }).length,
                    specialPets: pets.filter(pet => {
                        const conditions = pet.health?.specialCondition;
                        if (Array.isArray(conditions)) {
                            return conditions.some(condition => condition.toLowerCase() !== 'nenhuma');
                        }
                        return conditions && conditions.toLowerCase() !== 'nenhuma';
                    }).length,
                    vaccinatedPets: pets.filter(pet => pet.health?.vaccinated).length,
                    adoptedPets: pets.filter(pet => pet.status === 'Adotado').length,
                    petsByType: {},
                    petsByAge: {},
                    petsByStatus: {},
                    monthlyAdoptions: {
                        approved: Array(12).fill(0),
                        rejected: Array(12).fill(0),
                        completed: Array(12).fill(0)
                    },
                    monthlyRescues: Array(12).fill(0)
                }

                // Contagem por tipo
                pets.forEach(pet => {
                    if (pet.registerDate && new Date(pet.registerDate).getFullYear() === selectedYear) {
                        const date = new Date(pet.registerDate)
                        const month = date.getMonth()
                        newStats.monthlyRescues[month]++
                    }
                    newStats.petsByType[pet.type] = (newStats.petsByType[pet.type] || 0) + 1
                    newStats.petsByAge[pet.age] = (newStats.petsByAge[pet.age] || 0) + 1
                    newStats.petsByStatus[pet.status] = (newStats.petsByStatus[pet.status] || 0) + 1
                })

                // Processar adoções por mês
                adoptions.forEach(adoption => {
                    const date = new Date(adoption.requestDate)
                    if (date.getFullYear() !== selectedYear) return;
                    const month = date.getMonth()
                    switch (adoption.status) {
                        case 'approved':
                            newStats.monthlyAdoptions.approved[month]++
                            break
                        case 'rejected':
                            newStats.monthlyAdoptions.rejected[month]++
                            break
                        case 'completed':
                            newStats.monthlyAdoptions.completed[month]++
                            break
                    }
                })

                setStats(prev => ({ ...prev, ...newStats }))
            } catch (error) {
                console.error('Erro ao buscar dados:', error)
            } finally {
                setLoading(false)
            }
        }

        if (user?._id) {
            fetchData()
        }
    }, [user, selectedYear])

    // Função para gerar relatório em PDF
    const generatePDF = async () => {
        try {
            const doc = new jsPDF();

            // Logo - Buscar dados completos da ONG para obter a imagem
            let logoBase64;
            let imageFormat = 'JPEG';
            
            try {
                // Buscar dados completos da ONG
                const token = localStorage.getItem("token");
                const ongResponse = await fetch(`${API_URL}/ongs/${user._id}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                
                if (ongResponse.ok) {
                    const ongData = await ongResponse.json();
                    const ongImage = ongData.data?.profileImg || ongData.profileImg;
                    
                    if (ongImage && ongImage.trim() !== '') {
                        logoBase64 = await getBase64FromUrl(ongImage);
                        imageFormat = ongImage.includes('.png') ? 'PNG' : 'JPEG';
                    } else {
                        logoBase64 = await getBase64FromUrl('https://i.imgur.com/B2BFUeU.png');
                        imageFormat = 'PNG';
                    }
                } else {
                    // Fallback para imagem padrão se não conseguir buscar dados da ONG
                    logoBase64 = await getBase64FromUrl('https://i.imgur.com/B2BFUeU.png');
                    imageFormat = 'PNG';
                }
            } catch (error) {
                console.error('Erro ao carregar logo:', error);
                // Fallback para imagem padrão em caso de erro
                logoBase64 = await getBase64FromUrl('https://i.imgur.com/B2BFUeU.png');
                imageFormat = 'PNG';
            }
            
            doc.addImage(logoBase64, imageFormat, 80, 10, 50, 50);

            // Título principal
            doc.setTextColor(209, 77, 114);
            doc.setFontSize(24);
            doc.text(`Relatório de Estatísticas - ${user?.name || 'ONG'}`, 105, 70, { align: 'center' });

            // Data
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 80, { align: 'center' });

            // Linha separadora
            doc.setDrawColor(209, 77, 114);
            doc.setLineWidth(1);
            doc.line(20, 85, 190, 85);

            // Estatísticas Gerais
            doc.setTextColor(209, 77, 114);
            doc.setFontSize(18);
            doc.text('Estatísticas Gerais', 20, 100);

            autoTable(doc, {
                startY: 105,
                head: [['Métrica', 'Quantidade']],
                body: [
                    ['Total de Pets', stats.totalPets],
                    ['Pets Castrados', stats.castratedPets],
                    ['Pets Vermifugados', stats.dewormedPets],
                    ['Pets Especiais', stats.specialPets],
                    ['Pets Vacinados', stats.vaccinatedPets],
                ],
                theme: 'grid',
                headStyles: { fillColor: [209, 77, 114], textColor: 255, fontStyle: 'bold' },
                bodyStyles: { fillColor: [255, 255, 255], textColor: [60, 60, 60] },
                alternateRowStyles: { fillColor: [245, 230, 236] },
                styles: { fontSize: 12, cellPadding: 4 },
            });

            // Variável para controle de posição vertical das tabelas
            let y;
            // Distribuição por Tipo
            if (Object.keys(stats.petsByType).length > 0) {
                y = getStartY(doc);
                doc.setTextColor(209, 77, 114);
                doc.setFontSize(16);
                doc.text('Distribuição por Tipo', 20, y);

                autoTable(doc, {
                    startY: y + 5,
                    head: [['Tipo', 'Quantidade']],
                    body: Object.entries(stats.petsByType).map(([type, count]) => [type, count]),
                    theme: 'grid',
                    headStyles: { fillColor: [209, 77, 114], textColor: 255, fontStyle: 'bold' },
                    bodyStyles: { fillColor: [255, 255, 255], textColor: [60, 60, 60] },
                    alternateRowStyles: { fillColor: [245, 230, 236] },
                    styles: { fontSize: 12, cellPadding: 4 },
                });
            }

            // Distribuição por Status
            if (Object.keys(stats.petsByStatus).length > 0) {
                y = getStartY(doc);
                doc.setTextColor(209, 77, 114);
                doc.setFontSize(16);
                doc.text('Distribuição por Status', 20, y);

                autoTable(doc, {
                    startY: y + 5,
                    head: [['Status', 'Quantidade']],
                    body: Object.entries(stats.petsByStatus).map(([status, count]) => [status, count]),
                    theme: 'grid',
                    headStyles: { fillColor: [209, 77, 114], textColor: 255, fontStyle: 'bold' },
                    bodyStyles: { fillColor: [255, 255, 255], textColor: [60, 60, 60] },
                    alternateRowStyles: { fillColor: [245, 230, 236] },
                    styles: { fontSize: 12, cellPadding: 4 },
                });
            }

            // Adoções por mês
            y = doc.lastAutoTable.finalY + 15;
            doc.setTextColor(209, 77, 114);
            doc.setFontSize(16);
            doc.text('Adoções por Mês', 20, y);

            const months = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            autoTable(doc, {
                startY: y + 5,
                head: [['Mês', 'Aprovadas', 'Rejeitadas', 'Concluídas']],
                body: months.map((month, i) => [
                    month,
                    stats.monthlyAdoptions.approved[i],
                    stats.monthlyAdoptions.rejected[i],
                    stats.monthlyAdoptions.completed[i]
                ]),
                theme: 'grid',
                headStyles: { fillColor: [209, 77, 114], textColor: 255, fontStyle: 'bold' },
                bodyStyles: { fillColor: [255, 255, 255], textColor: [60, 60, 60] },
                alternateRowStyles: { fillColor: [245, 230, 236] },
                styles: { fontSize: 12, cellPadding: 4 },
            });

            doc.save('relatorio-estatisticas.pdf');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        }
    }

    // Função para gerar relatório em XLSX
    const generateXLSX = async () => {
      try {
        // Buscar todos os pets da ONG
        const token = localStorage.getItem("token");
        const petsResponse = await fetch(`${API_URL}/pets/by-ong/${user._id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const pets = await petsResponse.json();

        // Estatísticas Gerais
        const generalStats = [
          [user?.name || 'ONG'],
          ["Métrica", "Quantidade"],
          ["Total de Pets", stats.totalPets],
          ["Pets Castrados", stats.castratedPets],
          ["Pets Vermifugados", stats.dewormedPets],
          ["Pets Especiais", stats.specialPets],
          ["Pets Vacinados", stats.vaccinatedPets],
        ];

        // Distribuição por Tipo
        const typeStats = [
          [user?.name || 'ONG'],
          ["Tipo", "Quantidade"],
          ...Object.entries(stats.petsByType).map(([type, count]) => [type, count])
        ];

        // Distribuição por Status
        const statusStats = [
          [user?.name || 'ONG'],
          ["Status", "Quantidade"],
          ...Object.entries(stats.petsByStatus).map(([status, count]) => [status, count])
        ];

        // Adoções por mês
        const months = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const adoptionStats = [
          [user?.name || 'ONG'],
          ["Mês", "Aprovadas", "Rejeitadas", "Concluídas"],
          ...months.map((month, i) => [
            month,
            stats.monthlyAdoptions.approved[i],
            stats.monthlyAdoptions.rejected[i],
            stats.monthlyAdoptions.completed[i]
          ])
        ];

        // Lista completa de pets
        const petsList = [
          [user?.name || 'ONG'],
          ["Lista Completa de Pets Cadastrados"],
          [""], // Linha em branco
          [
            "Nome",
            "Espécie", 
            "Raça",
            "Idade",
            "Gênero",
            "Porte",
            "Status",
            "Vacinado",
            "Castrado", 
            "Vermifugado",
            "Condições Especiais",
            "Pelagem",
            "Localização",
            "Data de Cadastro",
            "Bio"
          ],
          ...pets.map(pet => [
            pet.name || "Não informado",
            pet.type || "Não informado",
            pet.breed || "Não informado", 
            pet.age || "Não informado",
            pet.gender || "Não informado",
            pet.size || "Não informado",
            pet.status || "Não informado",
            pet.health?.vaccinated ? "Sim" : "Não",
            pet.health?.castrated ? "Sim" : "Não",
            pet.health?.dewormed ? "Sim" : "Não",
            Array.isArray(pet.health?.specialCondition) 
              ? pet.health.specialCondition.join(", ") 
              : pet.health?.specialCondition || "Nenhuma",
            pet.coat || "Não informado",
            pet.city && pet.state ? `${pet.city}, ${pet.state}` : "Não informado",
            pet.registerDate ? new Date(pet.registerDate).toLocaleDateString('pt-BR') : "Não informado",
            pet.bio || "Sem descrição"
          ])
        ];

        // Cria um workbook com várias abas
        const wb = XLSX.utils.book_new();
        wb.Props = {
          Title: `Relatório de Estatísticas - ${user?.name || 'ONG'}`,
          CreatedDate: new Date()
        };

        wb.SheetNames.push("Estatísticas Gerais");
        wb.Sheets["Estatísticas Gerais"] = XLSX.utils.aoa_to_sheet(generalStats);

        wb.SheetNames.push("Por Tipo");
        wb.Sheets["Por Tipo"] = XLSX.utils.aoa_to_sheet(typeStats);

        wb.SheetNames.push("Por Status");
        wb.Sheets["Por Status"] = XLSX.utils.aoa_to_sheet(statusStats);

        wb.SheetNames.push("Adoções por Mês");
        wb.Sheets["Adoções por Mês"] = XLSX.utils.aoa_to_sheet(adoptionStats);

        wb.SheetNames.push("Lista de Pets");
        wb.Sheets["Lista de Pets"] = XLSX.utils.aoa_to_sheet(petsList);

        // Aplicar formatação à aba "Lista de Pets"
        const petsSheet = wb.Sheets["Lista de Pets"];
        
        // Definir largura das colunas
        const columnWidths = [
          { wch: 20 }, // Nome
          { wch: 12 }, // Espécie
          { wch: 15 }, // Raça
          { wch: 10 }, // Idade
          { wch: 10 }, // Gênero
          { wch: 12 }, // Porte
          { wch: 12 }, // Status
          { wch: 10 }, // Vacinado
          { wch: 10 }, // Castrado
          { wch: 12 }, // Vermifugado
          { wch: 25 }, // Condições Especiais
          { wch: 12 }, // Pelagem
          { wch: 20 }, // Localização
          { wch: 15 }, // Data de Cadastro
          { wch: 50 }  // Bio
        ];
        petsSheet['!cols'] = columnWidths;

        // Aplicar estilo ao cabeçalho (linha 4)
        for (let col = 0; col < petsList[3].length; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: 3, c: col });
          if (!petsSheet[cellRef]) {
            petsSheet[cellRef] = { v: petsList[3][col] };
          }
          petsSheet[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "D14D72" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }

        // Aplicar estilo ao título (linha 2)
        const titleCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
        if (petsSheet[titleCell]) {
          petsSheet[titleCell].s = {
            font: { bold: true, size: 14 },
            alignment: { horizontal: "center" }
          };
        }

        XLSX.writeFile(wb, `relatorio-estatisticas-${user?.name || 'ONG'}.xlsx`);
      } catch (error) {
        console.error('Erro ao gerar XLSX:', error);
        alert('Erro ao gerar o arquivo Excel. Por favor, tente novamente.');
      }
    };

    if (loading) {
        return <div className={styles.loading}>Carregando estatísticas...</div>
    }

    return (
        <div>
            <div className={styles.dashboard}>
                <div className={styles.total_dashboard}>
                    <div className={styles.total_info}>
                        <h3>Número de pets</h3>
                    <h1>{stats.totalPets}</h1>
                    </div>
                    <div className={styles.total_info}>
                    <h3>Pets Especiais</h3>
                    <h1>{stats.specialPets}</h1>
                    </div>
                    <div className={styles.total_info}>
                    <h3>Pets Castrados</h3>
                    <h1>{stats.castratedPets}</h1>
                    </div>
                    <div className={styles.total_info}>
                    <h3>Pets Vermifugados</h3>
                    <h1>{stats.dewormedPets}</h1>
                    </div>
                    <div className={styles.total_info}>
                        <h3>Pets Vacinados</h3>
                    <h1>{stats.vaccinatedPets}</h1>
                    </div>
                </div>

                <div className={styles.row_cards_dashboard}>
                    <div className={styles.big_card_dashboard}>
                    <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h2 style={{ margin: 0 }}>Gráfico de adoções por mês</h2>
                        <select 
                            className={styles['year-select']} 
                            value={selectedYear} 
                            onChange={e => setSelectedYear(Number(e.target.value))}
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                        <div className={styles.big_graph}>
                        <Line
                            data={{
                                labels: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
                                datasets: [
                                    {
                                        label: "Adoções aprovadas",
                                        data: stats.monthlyAdoptions.approved,
                                        backgroundColor: "#4CAF50",
                                        borderColor: "#4CAF50",
                                        pointBorderWidth: 2,
                                    },
                                    {
                                        label: "Adoções rejeitadas",
                                        data: stats.monthlyAdoptions.rejected,
                                        backgroundColor: "#FF3030",
                                        borderColor: "#FF3030",
                                        pointBorderWidth: 2,
                                    },
                                    {
                                        label: "Adoções concluídas",
                                        data: stats.monthlyAdoptions.completed,
                                        backgroundColor: "#060FF0",
                                        borderColor: "#060FF0",
                                        pointBorderWidth: 2,
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                        </div>
                    </div>

                    <div className={styles.big_card_dashboard}>
                    <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h2 style={{ margin: 0 }}>Pets registrados por mês</h2>
                        <select 
                            className={styles['year-select']} 
                            value={selectedYear} 
                            onChange={e => setSelectedYear(Number(e.target.value))}
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.big_graph}>
                        <Bar
                            data={{
                                labels: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
                                datasets: [
                                    {
                                        label: 'Quantidade de pets salvos',
                                        data: stats.monthlyRescues,
                                        barPercentage: 0.5,
                                        backgroundColor: ['#D14D72'],
                                        borderRadius: 5,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                scales: {
                                    x: { beginAtZero: true },
                                    y: { beginAtZero: true }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                maintainAspectRatio: false
                            }}
                        />
                        </div>
                    </div>
                </div>
               
            <div className={styles.row_cards_dashboard}>
                <div className={styles.card_dashboard}>
                    <h2>Espécies de Pets</h2>
                    <div className={styles.circle_graph}>
                        <Doughnut
                            data={{
                                labels: Object.keys(stats.petsByType),
                                datasets: [
                                    {
                                        data: Object.values(stats.petsByType),
                                        backgroundColor: ['#D14D72', 'rgb(255, 217, 0)', 'rgb(0, 110, 255)', 'rgb(0, 124, 37)']
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>

                <div className={styles.card_dashboard}>
                    <h2>Status dos Pets</h2>
                    <div className={styles.circle_graph}>
                        <Doughnut
                            data={{
                                labels: Object.keys(stats.petsByStatus),
                                datasets: [
                                    {
                                        data: Object.values(stats.petsByStatus),
                                        backgroundColor: ['#D14D72', '#4CAF50', '#FFA726', '#9E9E9E']
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>

                <div className={styles.card_dashboard}>
                    <h2>Quantidade de Pets por idade</h2>
                    <div className={styles.circle_graph}>
                        <Doughnut
                            data={{
                                labels: Object.keys(stats.petsByAge),
                                datasets: [
                                    {
                                        data: Object.values(stats.petsByAge),
                                        backgroundColor: ['#D14D72', 'rgb(255, 217, 0)', 'rgb(0, 110, 255)', 'rgb(0, 124, 37)']
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>
            </div>
            
            <div id={styles.look_button_space}>
                <div className={styles.report_container}>
                    <ButtonType 
                        type="button" 
                        onClick={() => setShowReportOptions(!showReportOptions)}
                    >
                        Gerar Relatório <CaretDown size={20} />
                    </ButtonType>
                    
                    {showReportOptions && (
                        <div className={styles.report_options}>
                            <button onClick={() => {
                                generatePDF()
                                setShowReportOptions(false)
                            }}>
                                Baixar PDF
                            </button>
                            <button onClick={() => {
                                generateXLSX()
                                setShowReportOptions(false)
                            }}>
                                Baixar Excel (.xlsx)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}

export default Dashboard