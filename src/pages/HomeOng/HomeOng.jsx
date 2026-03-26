import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../../components/Atoms/TitleType/TitleType";
import TitleType from "../../components/Atoms/TitleType/TitleType";
import "./HomeOng.css";
import { API_URL } from "../../config/api";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import PetShowcase from "../../components/Organisms/PetShowcase/PetShowcase";
import AdoptionsTable from "../../components/Organisms/AdoptionsTable/AdoptionsTable";
import AdoptionsList from "../../components/Organisms/AdoptionsList/AdoptionsList";
import useIsMobile from "../../hooks/useIsMobile";
import slugify from '../../utils/slugify';

const HomeOng = () => {
    const { user, userType, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const [pets, setPets] = useState([]);
    const [adoptions, setAdoptions] = useState([]);
    const [ongData, setOngData] = useState(null);

    // Corrigir obtenção do ongId
    const ongId = user?._id || localStorage.getItem('ongId');
    console.log('user:', user, 'ongId:', ongId);

    // Proteção de rota: só ONG logada pode acessar
    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            Swal.fire({
                icon: "warning",
                title: "Faça login para acessar",
                confirmButtonColor: "#d14d72",
            }).then(() => navigate("/login"));
            return;
        }
        if (userType !== "Ong" && userType !== "ONG") {
            Swal.fire({
                icon: "error",
                title: "Acesso restrito",
                text: "Apenas ONGs podem acessar esta página.",
                confirmButtonColor: "#d14d72",
            }).then(() => navigate("/home"));
            return;
        }
    }, [isAuthenticated, userType, navigate, isLoading]);

    useEffect(() => {
        if (isLoading) return;
        if (!ongId) {
            setOngData(null);
            setPets([]);
            setAdoptions([]);
            return;
        }
        const token = localStorage.getItem('token');
        const fetchData = async () => {
            try {
                // Buscar dados da ONG logada
                const ongRes = await fetch(`${API_URL}/ongs/${ongId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json"
                    }
                });
                const ongJson = await ongRes.json();
                setOngData(ongJson.data || ongJson);

                // Buscar pets da ONG
                const petsRes = await fetch(`${API_URL}/pets/by-ong/${ongId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json"
                    }
                });
                const petsData = await petsRes.json();
                const processedPets = (Array.isArray(petsData.data) ? petsData.data : petsData).map(pet => ({
                    id: pet._id,
                    image: pet.image?.[0] || pet.photos?.[0] || pet.imagens?.[0] || 
                           (Array.isArray(pet.image) && pet.image.length > 0 ? pet.image[0] : null) ||
                           "https://i.imgur.com/B2BFUeU.png",
                    name: pet.name,
                    gender: pet.gender,
                    age: pet.age,
                    type: pet.type,
                    hasSpecialCondition: pet.health?.specialCondition &&
                      (Array.isArray(pet.health.specialCondition) ? 
                       pet.health.specialCondition.some(condition => condition.toLowerCase() !== "nenhuma") :
                       pet.health.specialCondition.trim().toLowerCase() !== "nenhuma"),
                    specialCondition: Array.isArray(pet.health?.specialCondition) ? 
                                     pet.health.specialCondition.join(", ") : 
                                     pet.health?.specialCondition || "Nenhuma",
                    vaccinated: pet.health?.vaccinated || false,
                    castrated: pet.health?.castrated || false,
                    dewormed: pet.health?.dewormed || false,
                    coat: pet.coat || "",
                    status: pet.status || "Disponível",
                    waitingTime: pet.waitingTime,
                    registerDate: pet.registerDate
                }));
                console.log('Pets processados:', processedPets);
                setPets(processedPets);

                // Buscar adoções da ONG
                const adoptionsRes = await fetch(`${API_URL}/adoptions/by-ong/${ongId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json"
                    }
                });
                const adoptionsData = await adoptionsRes.json();
                if (!adoptionsRes.ok || !Array.isArray(adoptionsData.adoptions)) {
                    setAdoptions([]);
                } else {
                    setAdoptions(adoptionsData.adoptions);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                Swal.fire({
                    icon: "error",
                    title: "Erro ao carregar dados",
                    text: "Não foi possível carregar as informações da ONG.",
                });
            }
        };
        fetchData();
    }, [ongId, isLoading]);

    // Estatísticas
    const totalPets = pets.length;
    const adoptedPets = pets.filter(p => p.status === "Adotado").length;
    const availablePets = pets.filter(p => p.status === "Disponível").length;
    const pendingAdoptions = adoptions.filter(a => a.status === "requestReceived").length;
    
    // Calcula o tempo médio de espera
    const calculateWaitingTime = (pet) => {
        console.log('Calculando tempo de espera para pet:', pet);
        
        // Se tiver waitingTime definido, usa ele
        if (pet.waitingTime) {
            const waitingTime = parseInt(pet.waitingTime);
            console.log('Usando waitingTime:', waitingTime);
            return waitingTime || 0;
        }
        
        // Se não tiver waitingTime, calcula com base no registerDate
        if (pet.registerDate) {
            const registerDate = new Date(pet.registerDate);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - registerDate);
            const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Aproximação de 30 dias por mês
            console.log('Calculado com registerDate:', diffMonths);
            return diffMonths;
        }
        
        console.log('Nenhum tempo de espera encontrado');
        return 0;
    };

    const availablePetsList = pets.filter(p => p.status === "Disponível");
    console.log('Pets disponíveis:', availablePetsList);

    const waitingTimes = availablePetsList.map(calculateWaitingTime);
    console.log('Tempos de espera calculados:', waitingTimes);

    const avgWaiting = waitingTimes.length
        ? Math.round(waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length)
        : 0;

    console.log('Tempo médio de espera:', avgWaiting);

    if (isLoading) return <div>Carregando...</div>;

    if (!ongId) {
        return (
            <div style={{ padding: 32, textAlign: 'center' }}>
                <TitleType color="#D14D72" align="left">Não foi possível identificar a ONG logada.</TitleType>
                <p>Faça login novamente ou entre em contato com o suporte.</p>
            </div>
        );
    }

    return (
        <main className="home-ong-container">
            <section className="ong-header">
                <img src="/assets/logo/CP.jpg" alt="Logo Center Pet" className="ong-logo" />
                <div>
                    <Title>Bem-vinda, {ongData?.name || 'ONG'}!</Title>
                    <p className="ong-subtitle">
                        {ongData?.address?.city ? `Cidade: ${ongData.address.city}` : ''}
                        <br />
                        Aqui você gerencia seus pets, acompanha adoções e vê o impacto do seu trabalho!
                    </p>
                </div>
            </section>

            <section className="ong-dashboard">
                <div className="ong-stats-card">
                    <i className="fas fa-paw"></i>
                    <span className="stat-number">{totalPets}</span>
                    <span className="stat-label">Pets cadastrados</span>
                </div>
                <div className="ong-stats-card">
                    <i className="fas fa-heart"></i>
                    <span className="stat-number">{adoptedPets}</span>
                    <span className="stat-label">Pets adotados</span>
                </div>
                <div className="ong-stats-card">
                    <i className="fas fa-search"></i>
                    <span className="stat-number">{availablePets}</span>
                    <span className="stat-label">Disponíveis para adoção</span>
                </div>
                <div className="ong-stats-card">
                    <i className="fas fa-clock"></i>
                    <span className="stat-number">{pendingAdoptions}</span>
                    <span className="stat-label">Adoções pendentes</span>
                </div>
                <div className="ong-stats-card">
                    <i className="fas fa-hourglass-half"></i>
                    <span className="stat-number">
                        {avgWaiting > 0 ? `${avgWaiting} ${avgWaiting === 1 ? 'mês' : 'meses'}` : "N/A"}
                    </span>
                    <span className="stat-label">Tempo médio de espera</span>
                </div>
            </section>

            <section className="ong-actions">
                <Title>Ações rápidas</Title>
                <div className="ong-actions-buttons">
                    <a href="/register-pet" className="ong-action-btn">
                        <i className="fas fa-plus"></i> Cadastrar novo pet
                    </a>
                    <a href={`/catalog-filter?ongId=${ongId}`} className="ong-action-btn">
                        <i className="fas fa-list"></i> Gerenciar pets
                    </a>
                    <a href={ongData?.name ? `/ong-profile/${slugify(ongData.name)}` : '#'} className="ong-action-btn">
                        <i className="fas fa-user"></i> Ver meu perfil
                    </a>
                </div>
            </section>

            <section className="ong-impact">
                <Title>Seu impacto</Title>
                <p>
                    Obrigado por fazer parte da Center Pet! Seu trabalho transforma vidas e inspira mais pessoas a adotar.
                </p>
                <ul>
                    <li>🐾 Cada pet cadastrado aumenta as chances de adoção!</li>
                    <li>❤️ Acompanhe o tempo de espera dos pets e divulgue nas redes sociais.</li>
                    <li>📈 Veja o crescimento das adoções mês a mês no seu painel.</li>
                </ul>
            </section>

            <section className="ong-latest">
                <PetShowcase
                    title="Últimos pets cadastrados"
                    pets={pets.slice().reverse()}
                    category="all"
                    limit={5}
                    showAllPets={false}
                    ongId={ongId}
                />
            </section>

            <section className="ong-latest">
                {isMobile ? (
                    <AdoptionsList ongId={ongId} />
                ) : (
                    <AdoptionsTable ongId={ongId} />
                )}
            </section>
        </main>
    );
};

export default HomeOng;