import './ImageInputField.css';
import { useState, useEffect } from 'react';

const ImageInputField = ({ onImageChange, size = 300, currentImage }) => {
  const [srcImg, setSrcImg] = useState("");
  
  // Usar useEffect para atualizar a imagem quando currentImage mudar
  useEffect(() => {
    if (currentImage) {
      setSrcImg(currentImage);
    }
  }, [currentImage]);

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSrcImg(event.target.result);
      };
      reader.readAsDataURL(file);
      onImageChange(file); // envia o arquivo para o componente pai
    } else {
      setSrcImg(currentImage || "");
      onImageChange(null);
    }
  };

  return (
    <div
      id="profile-image"
      tabIndex="0"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <label
        className="picture"
        htmlFor="picture-input"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <span className="picture_image">
          {!srcImg ? "Escolha uma imagem" : <img src={srcImg} id="profile-img" alt="Preview" />}
        </span>
      </label>
      <input type="file" accept="image/*" id="picture-input" onChange={loadImage} />
    </div>
  );
};

export default ImageInputField;
