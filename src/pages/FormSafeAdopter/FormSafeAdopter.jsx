import TitleType from "../../components/Atoms/TitleType/TitleType";
import ButtonType from "../../components/Atoms/ButtonType/ButtonType";
import PhotoGallery from "../../components/Atoms/PhotoGallery/PhotoGallery.jsx";
import "./FormSafeAdopter.css";
import { useState } from "react";
import InputMask from "react-input-mask";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Supondo que você usa SweetAlert2 para notificações
import { API_URL } from "../../config/api.js";
import PawAnimation from "../../components/Molecules/PawAnimation/PawAnimation";
import ReactDOMServer from "react-dom/server";

const uploadImageToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "centerpet_default"); // mesmo preset do RegisterOng
  data.append("cloud_name", "dx8zzla5s");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dx8zzla5s/image/upload",
    {
      method: "POST",
      body: data,
    }
  );
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || "Erro ao enviar imagem");
  }
  return result.secure_url;
};

const FormSafeAdopter = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Estado para controlar a página atual
  const [noNumber, setNoNumber] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNoNumberChange = (e) => {
    setNoNumber(e.target.checked);
    if (e.target.checked) {
      setFormData({ ...formData, number: "S/N" });
    } else {
      setFormData({ ...formData, number: "" });
    }
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    setFormData({ ...formData, cep: e.target.value });

    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData((prevData) => ({
            ...prevData,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        } else {
          Swal.fire({
            icon: 'error',
            title: 'CEP não encontrado',
            text: 'Por favor, verifique e tente novamente.',
            confirmButtonColor: '#D14D72'
          });
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erro ao buscar CEP',
          text: 'Verifique sua conexão e tente novamente.',
          confirmButtonColor: '#D14D72'
        });
      }
    }
  };

  const brazilianStates = [
    { value: "AC", label: "Acre (AC)" },
    { value: "AL", label: "Alagoas (AL)" },
    { value: "AP", label: "Amapá (AP)" },
    { value: "AM", label: "Amazonas (AM)" },
    { value: "BA", label: "Bahia (BA)" },
    { value: "CE", label: "Ceará (CE)" },
    { value: "DF", label: "Distrito Federal (DF)" },
    { value: "ES", label: "Espírito Santo (ES)" },
    { value: "GO", label: "Goiás (GO)" },
    { value: "MA", label: "Maranhão (MA)" },
    { value: "MT", label: "Mato Grosso (MT)" },
    { value: "MS", label: "Mato Grosso do Sul (MS)" },
    { value: "MG", label: "Minas Gerais (MG)" },
    { value: "PA", label: "Pará (PA)" },
    { value: "PB", label: "Paraíba (PB)" },
    { value: "PR", label: "Paraná (PR)" },
    { value: "PE", label: "Pernambuco (PE)" },
    { value: "PI", label: "Piauí (PI)" },
    { value: "RJ", label: "Rio de Janeiro (RJ)" },
    { value: "RN", label: "Rio Grande do Norte (RN)" },
    { value: "RS", label: "Rio Grande do Sul (RS)" },
    { value: "RO", label: "Rondônia (RO)" },
    { value: "RR", label: "Roraima (RR)" },
    { value: "SC", label: "Santa Catarina (SC)" },
    { value: "SP", label: "São Paulo (SP)" },
    { value: "SE", label: "Sergipe (SE)" },
    { value: "TO", label: "Tocantins (TO)" },
  ];

  const validateStep = () => {
    const stepFields = document.querySelectorAll(`[data-step="${currentStep}"]`);

    // Validação dos campos obrigatórios
    for (let field of stepFields) {
      if (field.required && !formData[field.name]) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: `Por favor, preencha o campo: ${field.placeholder || field.name}`,
          confirmButtonColor: '#D14D72'
        });
        return false;
      }
    }

    // Validação específica para o PhotoGallery no passo 3
    if (currentStep === 2 && (!formData.environmentImages || formData.environmentImages.length < 2)) {
      Swal.fire({
        icon: 'warning',
        title: 'Fotos necessárias',
        text: 'Por favor, adicione pelo menos 2 fotos do ambiente.',
        confirmButtonColor: '#D14D72'
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const validateAllFields = () => {
    // Campos obrigatórios básicos
    const requiredFields = {
      birth: 'Data de Nascimento',
      phone: 'Telefone',
      profession: 'Profissão',
      cep: 'CEP',
      street: 'Rua',
      number: 'Número',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
      housingType: 'Tipo de Moradia',
      homeOwnership: 'Tipo de Propriedade',
      homeSafety: 'Segurança da Casa',
      numberOfHouseholdMembers: 'Número de Moradores',
      hasOrHadPets: 'Experiência com Pets',
      reasonToAdopt: 'Motivo da Adoção',
      expectedPetBehavior: 'Comportamento Esperado',
      howHandleUndesiredBehavior: 'Como Lidar com Comportamentos Indesejados',
      willingToTrain: 'Disposição para Adestramento',
      petAloneHoursPerDay: 'Tempo Sozinho por Dia',
      sleepingPlace: 'Local de Dormir',
      keepVaccinesUpToDate: 'Manter Vacinas em Dia',
      regularVetVisits: 'Visitas ao Veterinário',
      financialConditions: 'Condições Financeiras',
      awareOfLaw: 'Conhecimento da Lei',
      commitToNeverAbandon: 'Compromisso de Não Abandonar',
      returnToOng: 'Devolver à ONG',
      awareOfResponsibilities: 'Consciência das Responsabilidades',
      finalDeclarationAgreement: 'Declaração Final'
    };

    // Verificar campos obrigatórios básicos
    for (const [field, label] of Object.entries(requiredFields)) {
      if (field === 'finalDeclarationAgreement') {
        // Validação específica para checkbox
        if (!formData[field]) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo obrigatório',
            text: `Por favor, marque a declaração final para confirmar que concorda com os termos.`,
            confirmButtonColor: '#D14D72'
          });
          return false;
        }
      } else if (field === 'number') {
        // Validação específica para número - permite "S/N" ou número válido
        if (!formData[field] || (formData[field] !== 'S/N' && formData[field].trim() === '')) {
          Swal.fire({
            icon: 'warning',
            title: 'Campo obrigatório',
            text: `Por favor, preencha o campo: ${label}`,
            confirmButtonColor: '#D14D72'
          });
          return false;
        }
      } else if (!formData[field] || formData[field] === '') {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: `Por favor, preencha o campo: ${label}`,
          confirmButtonColor: '#D14D72'
        });
        return false;
      }
    }

    // Validações condicionais baseadas nas respostas
    if (formData.homeOwnership === "Rented" && !formData.petsAllowed) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obrigatório',
        text: 'Por favor, informe se há permissão para animais no local alugado.',
        confirmButtonColor: '#D14D72'
      });
      return false;
    }

    if (formData.numberOfHouseholdMembers > "0") {
      if (!formData.allergy) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, informe se alguém na casa tem alergia a animais.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }

      if (formData.allergy === "true" && !formData.allergyDetails) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, explique como pretende lidar com a alergia.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }

      if (!formData.familyAgreement) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, informe se todos na casa estão de acordo com a adoção.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }

      if (formData.familyAgreement === "false" && !formData.familyAgreementDetails) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, explique como pretende lidar com a discordância familiar.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }
    }

    if (formData.hasOrHadPets === "Já tive e tenho") {
      if (!formData.petOutcome) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, informe o que aconteceu com seus pets anteriores.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }

      if (formData.petOutcome === "Outro" && !formData.otherOutcome) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, explique o que aconteceu com seus pets anteriores.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }

      if (!formData.currentPetsDetails) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, informe sobre seus pets atuais.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }
    }

    if (formData.hasOrHadPets === "Já tive, mas não tenho nenhum no momento") {
      if (!formData.petOutcome1) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, informe o que aconteceu com seus pets anteriores.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }

      if (formData.petOutcome1 === "Outro" && !formData.otherOutcome1) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo obrigatório',
          text: 'Por favor, explique o que aconteceu com seus pets anteriores.',
          confirmButtonColor: '#D14D72'
        });
        return false;
      }
    }

    // Verificar se as imagens do ambiente foram adicionadas
    if (!formData.environmentImages || formData.environmentImages.length < 2) {
      Swal.fire({
        icon: 'warning',
        title: 'Fotos necessárias',
        text: 'Por favor, adicione pelo menos 2 fotos do ambiente.',
        confirmButtonColor: '#D14D72'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação completa antes do envio
    if (!validateAllFields()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Mostrar loading com PawAnimation
      const pawAnimationHtml = ReactDOMServer.renderToString(
        <PawAnimation text="Enviando formulário..." vertical={true} width={160} height={160} />
      );

      Swal.fire({
        title: 'Processando',
        html: pawAnimationHtml,
        showConfirmButton: false,
        allowOutsideClick: false
      });

      // 1. Upload das imagens do ambiente para o Cloudinary
      let environmentImageUrls = [];
      if (formData.environmentImages && formData.environmentImages.length > 0) {
        for (const imgObj of formData.environmentImages) {
          if (typeof imgObj === "string") {
            environmentImageUrls.push(imgObj);
          } else if (imgObj.file) {
            const url = await uploadImageToCloudinary(imgObj.file);
            environmentImageUrls.push(url);
          }
        }
      }

      // 2. Montar o objeto para envio ao backend
      const dataToSend = {
        ...formData,
        environmentImages: environmentImageUrls,
        email: user.email,
        _id: user._id,
        petsAllowed: formData.petsAllowed === "true",
        homeSafety: formData.homeSafety === "true",
        allergy: formData.allergy === "true",
        familyAgreement: formData.familyAgreement === "true",
        willingToTrain: formData.willingToTrain === "true",
        keepVaccinesUpToDate: formData.keepVaccinesUpToDate === "true",
        regularVetVisits: formData.regularVetVisits === "true",
        financialConditions: formData.financialConditions === "true",
        awareOfLaw: formData.awareOfLaw === "true",
        commitToNeverAbandon: formData.commitToNeverAbandon === "true",
        returnToOng: formData.returnToOng === "true",
        awareOfResponsibilities: formData.awareOfResponsibilities === "true",
        finalDeclarationAgreement: true,
        safeAdopter: true
      };

      const token = localStorage.getItem('token');

      if (!token) {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Erro de autenticação',
          text: 'Você precisa estar logado para enviar este formulário.',
          confirmButtonColor: '#D14D72'
        });
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/adopters/updateSafeAdopter`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json(); 

      Swal.close();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Formulário enviado com sucesso!',
          text: 'Você agora é um adotante seguro.',
          confirmButtonColor: '#D14D72'
        });
        
        updateUserData({ safeAdopter: true });
        navigate(`/adopter-profile/${user._id}`);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao enviar formulário',
          text: responseData.message || 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
          confirmButtonColor: '#D14D72'
        });
      }
    } catch (error) {
      Swal.close();
      console.error("Erro ao enviar formulário:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
        confirmButtonColor: '#D14D72'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Passo 1: Descrição
    <div key="step-1" data-step="0">
      <p className="form-description">
        O Formulário de Adoção é uma etapa essencial no processo de adoção responsável aqui no Center Pet. Ele foi criado com muito cuidado para <strong>garantir o bem-estar dos animais e ajudar as ONGs a conhecerem melhor os adotantes</strong>. As perguntas abordam aspectos importantes como o ambiente onde o pet viverá, experiências anteriores, rotina da casa e principalmente o compromisso com a segurança e os cuidados a longo prazo.
        <br />
        <br />
        ⚠️ Preencher com atenção e sinceridade é fundamental: <strong>quanto mais completas e conscientes forem as respostas, maiores são as chances de aprovação</strong>. Esse é o seu momento de mostrar que está pronto(a) para oferecer um lar cheio de amor, responsabilidade e segurança.
        <br />
        <br />
        🔒 As informações fornecidas neste formulário são protegidas e <strong>não serão divulgadas publicamente</strong>. Elas serão acessadas <strong>somente pela ONG responsável pelo pet que você deseja adotar</strong>.
        <br />
        <br />
        Ao escolher adotar com responsabilidade, você não apenas transforma a vida de um animal — mas também enriquece a sua com amor, companheirismo e propósito.
      </p>
    </div>,

    // Passo 2: Informações Pessoais
    <fieldset key="step-2" data-step="1">
      <legend>📌 Informações Pessoais</legend>
      <label>Data de Nascimento:</label>
      <input type="date" name="birth" placeholder="Nascimento" value={formData.birth || ""} onChange={handleChange} required data-step="1" />

      <InputMask mask="(99) 99999-9999" value={formData.phone || ""} onChange={handleChange}>
        {(inputProps) => (
          <input {...inputProps} type="tel" name="phone" placeholder="Telefone" required data-step="1"/>
        )}
      </InputMask>

      <input type="text" name="profession" placeholder="Profissão" value={formData.profession || ""} onChange={handleChange} required data-step="1" />

      <InputMask
        mask="99999-999"
        value={formData.cep || ""}
        onChange={handleCepChange}
      >
        {(inputProps) => (
          <input {...inputProps} type="text" name="cep" placeholder="CEP" required data-step="1" />
        )}
      </InputMask>

      <input type="text" name="street" placeholder="Rua" value={formData.street || ""} onChange={handleChange} required data-step="1" />
      <div className="number-input-container">
        <input 
          type="text" 
          name="number" 
          placeholder="Número" 
          value={formData.number || ""} 
          onChange={handleChange} 
          required 
          data-step="1"
          disabled={noNumber}
        />
        <label className="no-number-label">
          <input
            type="checkbox"
            checked={noNumber}
            onChange={handleNoNumberChange}
            data-step="1"
          />
          Sem número
        </label>
      </div>
      <input type="text" name="neighborhood" placeholder="Bairro" value={formData.neighborhood || ""} onChange={handleChange} required data-step="1" />
      <input type="text" name="complement" placeholder="Complemento (opcional)" value={formData.complement || ""} onChange={handleChange} data-step="1" />
      <input type="text" name="city" placeholder="Cidade" value={formData.city || ""} onChange={handleChange} required data-step="1" />
      <select name="state" value={formData.state || ""} onChange={handleChange} required data-step="1">
        <option value="">Selecione o Estado</option>
        {brazilianStates.map((state) => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </select>
    </fieldset>,

    // Passo 3: Informações do Ambiente
    <fieldset key="step-3" data-step="2">
      <legend>🏠 Sobre o Ambiente</legend>
      <label>Você mora em:</label>
      <select name="housingType" value={formData.housingType || ""} onChange={handleChange} required data-step="2">
        <option value="">Selecione</option>
        <option value="Casa">Casa</option>
        <option value="Apartamento">Apartamento</option>
        <option value="Sítio/Chácara">Sítio/Chácara</option>
      </select>

      <label>O imóvel é:</label>
      <select name="homeOwnership" value={formData.homeOwnership || ""} onChange={handleChange} required data-step="2">
        <option value="">Selecione</option> 
        <option value="Own">Próprio</option>
        <option value="Rented">Alugado</option>  
      </select>

      {formData.homeOwnership === "Rented" && (
        <>
          <label>Permissão para animais:</label>
          <select name="petsAllowed" value={formData.petsAllowed || ""} onChange={handleChange} required data-step="2">
            <option value="">Selecione</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </>
      )}

      <label>Ambiente é seguro (muro/tela)?</label>
      <select name="homeSafety" value={formData.homeSafety || ""} onChange={handleChange} required data-step="2">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      
      <label>Quantas pessoas moram com você?</label>
      <input type="number" name="numberOfHouseholdMembers" value={formData.numberOfHouseholdMembers || ""} onChange={handleChange} min="0" max="50" required data-step="2" />
      {formData.numberOfHouseholdMembers > "0" && (
        <>
          <label> Alguém na casa tem alergia a animais?</label>
          <select name="allergy" value={formData.allergy || ""} onChange={handleChange} required data-step="2">
            <option value="">Selecione</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>

      {formData.allergy === "true" && (
        <textarea name="allergyDetails" placeholder="Como pretende lidar com isso?" onChange={handleChange} required data-step="2"/>
      )}

      <label>Todos na casa estão de acordo com a adoção?</label>
      <select name="familyAgreement" value={formData.familyAgreement || ""} onChange={handleChange} required data-step="2">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>

      {formData.familyAgreement === "false" && (
        <textarea name="familyAgreementDetails" placeholder="Como pretende lidar com isso?" value={formData.familyAgreementDetails || ""} onChange={handleChange} required data-step="2"/>
      )}
      </>
    )}

      <label>Adicione fotos do ambiente (janelas, portões, ambientes com possibilidade de fuga do pet), mínimo 2:</label>
        <div className="image-inputs">
          <PhotoGallery
            maxImages={15}
            value={formData.environmentImages || []} 
            onImageChange={(images) =>
              setFormData((prevData) => ({
                ...prevData,
                environmentImages: images,
              }))
            }
          />
        </div>
    </fieldset>,

    // Passo 4: Experiência com Animais
    <fieldset key="step-4" data-step="3">
      <legend>🐶 Experiência com Animais</legend>
      <label>Você já teve ou tem pets?</label>
      <select name="hasOrHadPets" value={formData.hasOrHadPets || ""} onChange={handleChange} required data-step="3">
        <option value="">Selecione</option>
        <option value="Já tive e tenho">Já tive e tenho</option>
        <option value="Já tive, mas não tenho nenhum no momento">Já tive, mas não tenho nenhum no momento</option>
        <option value="Será o meu primeiro">Será o meu primeiro</option>
      </select>
      {formData.hasOrHadPets === "Já tive e tenho" &&( 
        <>
          <label>O que aconteceu com eles?</label>
          <select name="petOutcome" value={formData.petOutcome || ""}  onChange={handleChange} required data-step="3">
            <option value="">Selecione</option>
            <option value="Faleceu de causas naturais">Faleceu de causas naturais</option>
            <option value="Fugiu">Fugiu</option>
            <option value="Foi doado">Foi doado</option>
            <option value="Outro">Outro</option>
          </select>
          
          {formData.petOutcome === "Outro" && (
            <textarea name="otherOutcome" placeholder="Explique" value={formData.otherOutcome || ""} onChange={handleChange} required data-step="3"/>
          )}

          <textarea name="currentPetsDetails" placeholder="Sobre seus pets atuais, quais e quantos são?" value={formData.currentPetsDetails || ""}  onChange={handleChange} required data-step="3"/>
        </>
      )}

      {formData.hasOrHadPets === "Já tive, mas não tenho nenhum no momento" && (
        <>
          <label>O que aconteceu com eles?</label>
          <select name="petOutcome1" value={formData.petOutcome1 || ""} onChange={handleChange} required data-step="3">
            <option value="">Selecione</option>
            <option value="Faleceu de causas naturais">Faleceu de causas naturais</option>
            <option value="Fugiu">Fugiu</option>
            <option value="Foi doado">Foi doado</option>
            <option value="Outro">Outro</option>
          </select>

          {formData.petOutcome1 === "Outro" && (
            <textarea name="otherOutcome1" placeholder="Explique" value={formData.otherOutcome1 || ""} onChange={handleChange} required data-step="3"/>
          )}
        </>
      )}
    </fieldset>,

    // Passo 5: Comportamento e Rotina
    <fieldset key="step-5" data-step="4">
      <legend>🧠 Comportamento e Rotina</legend>
      <textarea name="reasonToAdopt" placeholder="Por que deseja adotar um pet?" value={formData.reasonToAdopt || ""} onChange={handleChange} required data-step="4" />
      <textarea name="expectedPetBehavior" placeholder="O que espera do comportamento do animal?" value={formData.expectedPetBehavior || ""} onChange={handleChange} required data-step="4"/>
      <textarea name="howHandleUndesiredBehavior" placeholder="Como lidará com comportamentos indesejados?" value={formData.howHandleUndesiredBehavior || ""} onChange={handleChange} required data-step="4"/>
      <label>Está disposto a buscar adestramento?</label>
      <select name="willingToTrain" value={formData.willingToTrain || ""} onChange={handleChange} required data-step="4">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      <textarea name="petAloneHoursPerDay" placeholder="Por quanto tempo o pet ficará sozinho por dia?" value={formData.petAloneHoursPerDay || ""} onChange={handleChange} required data-step="4" />
      <textarea name="sleepingPlace" placeholder="Onde ele dormirá?" value={formData.sleepingPlace || ""} onChange={handleChange} required data-step="4" />
    </fieldset>,

    // Passo 6: Cuidados e Saúde
    <fieldset key="step-6" data-step="5">
      <legend>🛡️ Segurança e Cuidados</legend>
      <label>Manterá vacinas e vermífugos em dia?</label>
      <select name="keepVaccinesUpToDate" value={formData.keepVaccinesUpToDate || ""} onChange={handleChange} required data-step="5">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      <label>Levará ao veterinário com regularidade?</label>
      <select name="regularVetVisits" value={formData.regularVetVisits || ""} onChange={handleChange} required data-step="5">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      <label>Tem condições financeiras para manter o pet?</label>
      <select name="financialConditions" value={formData.financialConditions || ""} onChange={handleChange} required data-step="5">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      <label>
        Está ciente da "
        <a 
          href="https://www.planalto.gov.br/ccivil_03/leis/l9605.htm" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: "#D14D72", textDecoration: "underline" }}
        > 
          Lei 9.605/98
        </a> 
        " (crime de maus-tratos)?
      </label>
      <select name="awareOfLaw" value={formData.awareOfLaw || ""} onChange={handleChange} required data-step="5">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      <label>Se compromete a NUNCA abandonar o pet?</label>
      <select name="commitToNeverAbandon" value={formData.commitToNeverAbandon || ""} onChange={handleChange} required data-step="5">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
      <label>Devolveria o pet à ONG se não puder cuidar?</label>
      <select name="returnToOng" value={formData.returnToOng || ""} onChange={handleChange} required data-step="5">
        <option value="">Selecione</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
    </fieldset>,

    // Passo 7: Conscientização e Declaração Final
    <fieldset key="step-7" data-step="6">
      <legend>📚 Conscientização e Declaração Final</legend>
      <label>Está ciente das responsabilidades de adotar?</label>
      <select name="awareOfResponsibilities" value={formData.awareOfResponsibilities || ""} onChange={handleChange} required data-step="6">
        <option value="">Selecione</option>
        <option value="true">Sim, estou ciente e preparado(a)</option>
        <option value="false">Não</option>
      </select>
      <label className="confirmation-label">
        <input className="checkbox-confirmation" type="checkbox" name="finalDeclarationAgreement" onChange={handleChange} required data-step="6" />
        <p>Declaro que as informações são verdadeiras e estou ciente das responsabilidades legais e morais ao adotar um animal. 
        </p>
      </label>
    </fieldset>
  ];

  return (
    <div className="form-page">
      <div className="form-content">
        <TitleType>Formulário de Adoção</TitleType>
        <form className="adoption-form" onSubmit={handleSubmit}>
          {steps[currentStep]}

          <div className="form-navigation">
            {currentStep > 0 && (
              <ButtonType type="button" onClick={handlePrevious} bgColor="#D14D72">
                Voltar
              </ButtonType>
            )}
            {currentStep < steps.length - 1 ? (
              <ButtonType type="button" onClick={handleNext} bgColor="#D14D72">
                Próximo
              </ButtonType>
            ) : (
              <ButtonType type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar"}
              </ButtonType>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormSafeAdopter;