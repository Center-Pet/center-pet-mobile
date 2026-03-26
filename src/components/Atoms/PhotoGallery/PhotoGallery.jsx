import React from "react";
import { Plus, X } from "phosphor-react";
import Swal from "sweetalert2";
import "./PhotoGallery.css";

const PhotoGallery = ({ maxImages = 5, value = [], onImageChange }) => {
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (value.length + files.length > maxImages) {
      Swal.fire({
        icon: 'warning',
        title: 'Limite de imagens',
        text: `Você pode adicionar no máximo ${maxImages} imagens.`,
        confirmButtonColor: '#D14D72'
      });
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    onImageChange([...value, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = value.filter((_, i) => i !== index);
    onImageChange(newImages);
  };

  return (
    <div className="photo-gallery">
      {value.map((image, index) => (
        <div key={index} className="photo-gallery-item">
          <img src={image.preview} alt={`Preview ${index + 1}`} />
          <button
            className="remove-button"
            onClick={() => removeImage(index)}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      {value.length < maxImages && (
        <label className="photo-gallery-item">
          <div className="upload-placeholder">
            <Plus className="upload-icon" weight="bold" />
            <span className="upload-text">Adicionar foto</span>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </label>
      )}
    </div>
  );
};

export default PhotoGallery;