import { ChatsCircle, Cat, Dog, PawPrint } from 'phosphor-react';
import Swal from 'sweetalert2';
import './ChatButton.css';

const ChatButton = () => {
  const handleChatClick = () => {
    // Array de mensagens engraçadas para mostrar aleatoriamente
    const messages = [
      "Nossos gatinhos de suporte ainda estão tirando uma soneca...",
      "Ops! Nossos atendentes caninos estão em treinamento de digitação...",
      "Estamos ensinando nossos pets a digitar... não é fácil sem dedos!",
      "Um momento! Estamos adicionando mais petiscos ao nosso sistema de chat."
    ];

    // Seleciona uma mensagem aleatória
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Ícones para alternar entre gato e cachorro
    const icon = Math.random() > 0.5 ?
      '<i class="ph ph-cat" style="font-size: 50px; color: #D14D72;"></i>' :
      '<i class="ph ph-dog" style="font-size: 50px; color: #D14D72;"></i>';

    Swal.fire({
      title: 'Chat em desenvolvimento!',
      html: `
        ${icon}
        <p style="margin-top: 15px; font-size: 16px;">${randomMessage}</p>
        <p style="margin-top: 10px; font-size: 15px;">Em breve você poderá falar com nossa equipe de especialistas em patinhas!</p>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Mal posso esperar!',
      confirmButtonColor: '#D14D72',
      showCancelButton: true,
      cancelButtonText: 'OK, voltarei depois',
      cancelButtonColor: '#FFABAB',
      backdrop: `
        rgba(255,171,171,0.4)
        url("/paw-pattern.png")
      `,
      customClass: {
        popup: 'chat-popup-custom'
      },
      timer: 8000,
      timerProgressBar: true,
      footer: '<span style="color: #666; font-size: 12px;">🐾 CenterPet - Conectando patinhas e corações</span>'
    });
  };

  return (
    <button
      className="floating-help"
      aria-label="Ajuda ou Chat"
      onClick={handleChatClick}
    >
      <ChatsCircle />
    </button>
  );
};

export default ChatButton;