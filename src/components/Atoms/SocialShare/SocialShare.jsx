"use client";

import React from 'react';
import { Share } from "@phosphor-icons/react";
import "./SocialShare.css";
import Swal from 'sweetalert2';

const SocialShare = ({ url, title }) => {
  const handleShare = async () => {
    // Usar valores padrão se as props não forem fornecidas
    const shareUrl = url || window.location.href;
    const shareTitle = title || 'Center Pet - Adoção de Animais';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl
        });
      } catch (error) {
        console.error("Erro ao compartilhar conteúdo:", error);
        // Se o usuário cancelou o compartilhamento, não mostrar erro
        if (error.name !== 'AbortError') {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao compartilhar',
            text: 'Não foi possível compartilhar o conteúdo.',
            confirmButtonColor: '#D14D72'
          });
        }
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl);
        Swal.fire({
          icon: 'success',
          title: 'Link copiado!',
          text: 'O link foi copiado para a área de transferência.',
          confirmButtonColor: '#D14D72'
        });
      } catch (error) {
        console.error("Erro ao copiar link:", error);
        Swal.fire({
          icon: 'info',
          title: 'Compartilhar',
          text: `Copie o link para compartilhar: ${shareUrl}`,
          confirmButtonColor: '#D14D72'
        });
      }
    }
  };

  return (
    <button
      className="inline-share-button"
      onClick={handleShare}
      aria-label="Compartilhar esta página"
      title="Compartilhar"
    >
      <Share size={27} weight="regular" color="#d25b82" />
    </button>
  );
};

export default SocialShare;
