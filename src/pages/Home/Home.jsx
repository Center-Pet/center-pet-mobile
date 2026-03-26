import React, { useState, useEffect } from "react";
import Hero from "../../components/Molecules/Banner/Banner";
import PetShowcase from "../../components/Organisms/PetShowcase/PetShowcase";
import ScrollToTop from "../../components/Atoms/ScrollToTop/ScrollToTop";
import Title from "../../components/Atoms/TitleType/TitleType";
import OngChart from "../../components/Molecules/OngChart/OngChart";
import "./Home.css";
import { API_URL } from "../../config/api";
import { getPets } from "../../services/petService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import slugify from "../../utils/slugify";

const Home = () => {
  const [pets, setPets] = useState([]);
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOngs, setLoadingOngs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        // Usar o serviço de pets com paginação
        const petsData = await getPets('disponiveis', currentPage, 10);
        
        if (currentPage === 1) {
          setPets(petsData);
        } else {
          setPets(prevPets => [...prevPets, ...petsData]);
        }

        // Se recebemos menos pets que o limite, não há mais páginas
        setHasMore(petsData.length === 10);
      } catch (error) {
        console.error("Erro ao buscar os pets:", error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchOngs = async () => {
      setLoadingOngs(true);
      try {
        const response = await fetch(`${API_URL}/ongs`);
        const data = await response.json();
        
        const ongsArray = Array.isArray(data.data) ? data.data : data;
        setOngs(ongsArray);
      } catch (error) {
        console.error("Erro ao buscar as ONGs:", error);
        setOngs([]);
      } finally {
        setLoadingOngs(false);
      }
    };

    fetchPets();
    fetchOngs();
  }, [currentPage]);

  const loadMorePets = () => {
    if (!loading && hasMore) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  return (
    <main className="home-container">
      <Hero />

      <section className="pet-section-intro">
        <h2 className="section-title">
          Conheça nossos pets disponíveis para adoção
        </h2>
        <p className="section-subtitle">
          Eles estão esperando por um lar cheio de amor e cuidado. Veja abaixo
          os pets disponíveis e agende uma visita!
        </p>
      </section>

      <section className="showcase-section">
        {loading && currentPage === 1 ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <PetShowcase title={"Pets Disponíveis"} pets={pets} limit={10} />
            {hasMore && (
              <button 
                className="load-more-button"
                onClick={loadMorePets}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Carregar mais pets'}
              </button>
            )}
          </>
        )}
      </section>

      {/* COMO FUNCIONA */}
      <section className="how-it-works">
        <h2 className="section-title">Como Funciona</h2>
        <div className="steps-container">
          <div className="step-card">
            <i className="fas fa-user-plus"></i> {/* Ícone de cadastro */}
            <h3>Cadastrar</h3>
            <p>Crie sua conta e acesse os pets disponíveis.</p>
          </div>
          <div className="step-card">
            <i className="fas fa-search"></i> {/* Ícone de escolha */}
            <h3>Escolher</h3>
            <p>Explore e encontre seu futuro companheiro.</p>
          </div>
          <div className="step-card">
            <i className="fas fa-calendar-alt"></i> {/* Ícone de agendamento */}
            <h3>Agendar</h3>
            <p>Combine com a ONG uma visita ou conversa.</p>
          </div>
          <div className="step-card">
            <i className="fas fa-heart"></i> {/* Ícone de adoção */}
            <h3>Adotar</h3>
            <p>Leve amor e alegria para sua casa!</p>
          </div>
        </div>
      </section>

      {/* CURIOSIDADES */}
      <section className="curiosities-section">
        <h2 className="section-title">Curiosidades sobre adoção</h2>
        <div className="curiosities-cards">
          <div className="curiosity-card">
            <i className="fas fa-paw"></i>
            <h3>Mais de 30 milhões</h3>
            <p>
              No Brasil, há mais de 30 milhões de animais abandonados esperando
              por um lar.
            </p>
          </div>
          <div className="curiosity-card">
            <i className="fas fa-heartbeat"></i>
            <h3>Benefícios à saúde</h3>
            <p>
              Adotar um pet pode reduzir o estresse, a solidão e até a pressão
              arterial.
            </p>
          </div>
          <div className="curiosity-card">
            <i className="fas fa-gavel"></i>
            <h3>É lei!</h3>
            <p>
              O abandono de animais é crime no Brasil, com pena de detenção e
              multa.
            </p>
          </div>
          <div className="curiosity-card">
            <i className="fas fa-hands-helping"></i>
            <h3>ONGs parceiras</h3>
            <p>
              ONGs são fundamentais para o resgate, cuidado e adoção responsável
              dos pets.
            </p>
          </div>
        </div>
      </section>

      {/* EVENTOS E CAMPANHAS
      <section className="events-section">
        <h2 className="section-title">Eventos & Campanhas</h2>
        <div className="events-banners">
          <div className="event-banner">
            <img src="/assets/feira-adocao.png" alt="Feira de Adoção" />
            <div className="event-info">
              <h3>Feira de Adoção - Maio</h3>
              <p>
                Participe da nossa feira presencial e encontre seu novo melhor
                amigo! 25/05, das 10h às 16h, Parque Central.
              </p>
            </div>
          </div>
          <div className="event-banner">
            <img src="/assets/castracao.jpeg" alt="Campanha de Castração" />
            <div className="event-info">
              <h3>Campanha de Castração Solidária</h3>
              <p>
                Vagas limitadas para castração gratuita de cães e gatos.
                Inscreva-se até 10/06!
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* SOBRE NÓS */}
      <section className="about-section">
        <div className="about-card about-card-single">
          {/* Primeira linha: texto à esquerda, imagem à direita */}
          <div className="about-row-custom">
            <div className="about-text about-text-left">
              <Title>Sobre a Center Pet</Title>
              <p>
                Aqui na Center Pet, acreditamos que todo animal merece um lar
                cheio de amor e cuidado. Nossa missão é conectar ONGs e
                protetores de animais a pessoas dispostas a adotar, tornando o
                processo mais acessível, transparente e eficiente.
              </p>
              <p>
                Desenvolvemos uma plataforma intuitiva, onde as ONGs podem
                cadastrar e manter um catálogo atualizado de animais disponíveis
                para adoção. Cada pet tem seu próprio perfil, com informações
                como nome, idade, peso, condição de saúde e fotos.
              </p>
            </div>
            <div className="about-img-wrapper about-img-wrapper-right">
              <img
                src="./assets/logo/CP.jpg"
                alt="Sobre a Center Pet"
                className="about-img"
              />
            </div>
          </div>
          {/* Segunda linha: imagem à esquerda, texto à direita */}
          <div className="about-row-custom about-row-custom-reverse">
            <div className="about-img-wrapper about-img-wrapper-left">
              <img
                src="https://www.vereadorafernandamoreno.com.br/wp-content/uploads/2020/12/Protetor-de-animais.jpg"
                alt="Adoção responsável"
                className="about-img"
              />
            </div>
            <div className="about-text about-text-right">
              <p>
                Se você está em busca de um novo companheiro, pode navegar
                facilmente pela plataforma, filtrar os animais conforme suas
                preferências e entrar em contato diretamente com a ONG
                responsável. Queremos tornar o ato de adotar mais simples e
                significativo, ajudando a criar laços duradouros entre humanos e
                seus novos amigos de quatro patas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ORGULHO EM APOIAR ONGS */}
      <section className="proud-ongs-section">        
        {loadingOngs ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <PetShowcase 
            title="Temos orgulho em apoiar essas ONGs incríveis" 
            category="ongs"
            customComponent={(ong) => (
              <OngChart 
                ongData={ong} 
                slug={slugify(ong.name)}
                onClick={() => navigate(`/ong-profile/${slugify(ong.name)}`)}
              />
            )}
            pets={ongs}
            limit={9}
          />
        )}
      </section>

      {/* DEPOIMENTOS DE ADOTANTES
      <section className="testimonials-section">
        <h2 className="section-title">Quem já adotou recomenda!</h2>
        <p className="section-subtitle">
          Veja o que dizem pessoas que transformaram vidas adotando um pet.
        </p>
        <div className="testimonials-cards">
          <div className="testimonial-card">
            <div className="testimonial-photos">
              <img
                src="/assets/pet1.jpeg"
                alt="Pet adotado"
                className="testimonial-pet"
              />
              <img
                src="/assets/person1.jpg"
                alt="Adotante"
                className="testimonial-person"
              />
            </div>
            <p className="testimonial-text">
              "A adoção mudou minha vida! Ganhei um amigo fiel e muito amor em
              casa. Recomendo para todos!"
            </p>
            <span className="testimonial-author">
              — Marcos Henrique, São Paulo/SP
            </span>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-photos">
              <img
                src="/assets/pet2.jpg"
                alt="Pet adotado"
                className="testimonial-pet"
              />
              <img
                src="/assets/person2.jpg"
                alt="Adotante"
                className="testimonial-person"
              />
            </div>
            <p className="testimonial-text">
              "O processo foi simples e seguro. Hoje não me imagino sem a Mel.
              Obrigado, Center Pet!"
            </p>
            <span className="testimonial-author">
              — Carlos Henrique, Belo Horizonte/MG
            </span>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-photos">
              <img
                src="/assets/pet3.png"
                alt="Pet adotado"
                className="testimonial-pet"
              />
              <img
                src="/assets/person3.jpeg"
                alt="Adotante"
                className="testimonial-person"
              />
            </div>
            <p className="testimonial-text">
              "Adotar é um ato de amor. Fui muito bem orientada e encontrei o
              pet perfeito para minha família."
            </p>
            <span className="testimonial-author">
              — Juliana Souza, Curitiba/PR
            </span>
          </div>
        </div>
      </section> */}

      {/* PARCERIAS */}
      <section className="partners-section">
        <h2 className="section-title">Parcerias que transformam vidas</h2>
        <p className="section-subtitle">
          Amplie o alcance do seu trabalho e ajude mais pets a encontrarem um
          lar amoroso.
        </p>
        <div className="partners-content">
          <div className="partners-text">
            <h3>Você representa uma ONG ou algum projeto?</h3>
            <p>
              Faça parte do nosso time de parceiros e tenha seus pets
              disponíveis para adoção divulgados gratuitamente na nossa
              plataforma.
            </p>
            <a href="/register-ong" className="partner-button">
              Quero ser parceiro
            </a>
          </div>
          <div className="partners-image">
            <img
              src="/assets/logo/Center-Pet.jpg"
              alt="Imagem de parceria com ONG"
            />
          </div>
        </div>
      </section>

      {/* CTA Secundário e Redes Sociais */}
      <section className="cta-social-section">
        <div className="cta-buttons">
          {/* Sem href por enquanto */}
          <a className="cta-secondary donate">Doar para um projeto</a>
        </div>
      </section>

      <button
        className="floating-help"
        aria-label="Ajuda ou Chat"
        onClick={() => Swal.fire({
          icon: 'info',
          title: 'Em breve!',
          text: 'Em breve você poderá falar com a gente!',
          confirmButtonColor: '#D14D72'
        })}
      >
        <i className="fas fa-comments"></i>
      </button>
    </main>
  );
};

export default Home;
