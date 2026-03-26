import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom"; // Adicione esta linha
import "swiper/css";
import "swiper/css/pagination";
import "./Banner.css";

const Banner = () => {
  const navigate = useNavigate(); // Adicione esta linha

  const slides = [
    {
      title: "Transforme Vidas",
      text: "Adotar um pet é mais do que dar um lar. É oferecer amor, cuidado e uma nova chance para quem só quer fazer parte da sua família.",
      image: "/assets/curiosidade1.jpg",
      alt: "Imagem de um pet esperando adoção",
    },
    {
      title: "Benefícios para Você",
      text: "Ter um pet em casa reduz o estresse, combate a solidão e traz mais alegria para o seu dia a dia. Adote e sinta a diferença!",
      image: "/assets/curiosidade2.jpg",
      alt: "Imagem de um pet feliz com sua nova família",
    },
    {
      title: "Faça a Diferença",
      text: "Ao adotar, você salva uma vida e ajuda a abrir espaço para que outros animais também tenham uma chance de encontrar um lar.",
      image: "/assets/curiosidade3.jpg",
      alt: "Imagem de um pet sendo cuidado",
    },
    {
      title: "Adote com Amor",
      text: "Mais do que um animal de estimação, um pet é um companheiro fiel que transforma sua casa em um lar cheio de felicidade.",
      image: "/assets/curiosidade4.jpg",
      alt: "Imagem de um pet brincando com sua família",
    },
  ];

  return (
    <section className="banner-section">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="banner-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={`banner-slide ${index % 2 === 0 ? "left" : "right"}`}>
              <div className="banner-content">
                <h1>{slide.title}</h1>
                <p>{slide.text}</p>
                <button
                  className="banner-button"
                  onClick={() => navigate('/catalog')}
                >
                  Adote Agora!
                </button>
              </div>
              <div className="banner-image">
                <img src={slide.image} alt={slide.alt} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Banner;