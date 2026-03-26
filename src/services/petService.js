/**
 * Serviço para buscar pets da API
 */

import { API_URL } from "../config/api";

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos em milissegundos

/**
 * Função para fazer requisição com retry
 */
const fetchWithRetry = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      // Aguardar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

/**
 * Busca pets por categoria com cache
 * @param {string} category - Categoria dos pets (pacientes, novos, especiais)
 * @param {number} page - Número da página
 * @param {number} limit - Limite de pets por página
 * @returns {Promise<Array>} Lista de pets formatada para o componente PetShowcase
 */
export const getPets = async (category, page = 1, limit = 10) => {
    try {
        // Verificar cache
        const cacheKey = `pets_${category}_${page}_${limit}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('Retornando dados do cache para:', category);
                return data;
            }
        }

        let endpoint = `${API_URL}/pets`;
        let queryParams = new URLSearchParams();

        // Configurar parâmetros com base na categoria
        if (category === 'pacientes') {
            // Pets que estão esperando há mais tempo
            queryParams.append('sort', 'waitingTime');
            queryParams.append('order', 'desc');
        } else if (category === 'novos') {
            // Pets recém adicionados
            queryParams.append('sort', 'createdAt');
            queryParams.append('order', 'desc');
        } else if (category === 'especiais') {
            // Pets com necessidades especiais
            queryParams.append('specialCondition', 'true');
        }

        // Adicionar filtro de status para pets disponíveis
        queryParams.append('status', 'Disponível');

        // Adicionar parâmetros de paginação
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        // Fazer requisição à API com retry
        const response = await fetchWithRetry(`${endpoint}?${queryParams.toString()}`);
        const result = await response.json();
        console.log(`Resposta da API para categoria ${category}:`, result);

        // Extrair os dados de pets da resposta
        // A API pode retornar os pets em result.data ou diretamente em result
        const petsData = result.data || result;

        if (!Array.isArray(petsData)) {
            console.error('Formato de resposta inesperado:', result);
            return [];
        }

        // Formatar os dados para o formato esperado pelo PetShowcase
        const formattedPets = petsData.map(pet => ({
            id: pet._id,
            name: pet.name,
            image: pet.image?.[0] || pet.photos?.[0] || pet.imagens?.[0] || 
                   (Array.isArray(pet.image) && pet.image.length > 0 ? pet.image[0] : null) ||
                   "https://i.imgur.com/B2BFUeU.png",
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
            status: pet.status || "Disponível"
        }));

        // Salvar no cache
        localStorage.setItem(cacheKey, JSON.stringify({
            data: formattedPets,
            timestamp: Date.now()
        }));

        return formattedPets;
    } catch (error) {
        console.error(`Erro ao buscar pets da categoria ${category}:`, error);
        return [];
    }
};

/**
 * Busca um pet específico pelo ID com cache
 * @param {string} id - ID do pet
 * @returns {Promise<Object|null>} Dados do pet ou null em caso de erro
 */
export const getPetById = async (id) => {
    try {
        // Verificar cache
        const cacheKey = `pet_${id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('Retornando dados do cache para pet:', id);
                return data;
            }
        }

        // Fazer requisição com retry
        const response = await fetchWithRetry(`${API_URL}/pets/${id}`);
        const data = await response.json();

        // Salvar no cache
        localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));

        return data;
    } catch (error) {
        console.error(`Erro ao buscar pet com ID ${id}:`, error);
        return null;
    }
};

/**
 * Busca pets por ONG com cache otimizado
 * @param {string} ongId - ID da ONG
 * @returns {Promise<Array>} Lista de pets da ONG
 */
export const getPetsByOng = async (ongId) => {
    try {
        const result = await fetch(`${API_URL}/pets/by-ong/${ongId}`);
        const petsData = result.data || result;
        
        if (!Array.isArray(petsData)) {
            return [];
        }

        return petsData;
    } catch (error) {
        console.error(`Erro ao buscar pets da ONG ${ongId}:`, error);
        return [];
    }
};

/**
 * Busca todas as ONGs com cache otimizado
 * @returns {Promise<Array>} Lista de ONGs
 */
export const getAllOngs = async () => {
    try {
        const result = await fetch(`${API_URL}/ongs`);
        const ongsData = result.data || result;
        
        if (!Array.isArray(ongsData)) {
            return [];
        }

        return ongsData;
    } catch (error) {
        console.error('Erro ao buscar ONGs:', error);
        return [];
    }
};

/**
 * Busca dados de uma ONG específica
 * @param {string} ongId - ID da ONG
 * @returns {Promise<Object|null>} Dados da ONG ou null em caso de erro
 */
export const getOngById = async (ongId) => {
    try {
        const data = await fetch(`${API_URL}/ongs/${ongId}`);
        return data.data || data;
    } catch (error) {
        console.error(`Erro ao buscar ONG com ID ${ongId}:`, error);
        return null;
    }
};

/**
 * Prefetch de dados comuns para melhorar performance
 */
export const prefetchCommonData = async () => {
    try {
        await fetch(`${API_URL}/pets?status=Disponível&limit=10`);
        await fetch(`${API_URL}/ongs`);
        await fetch(`${API_URL}/pets?category=especiais&limit=5`);
        await fetch(`${API_URL}/pets?category=novos&limit=5`);
        console.log('Prefetch de dados comuns concluído');
    } catch (error) {
        console.warn('Erro no prefetch:', error);
    }
};