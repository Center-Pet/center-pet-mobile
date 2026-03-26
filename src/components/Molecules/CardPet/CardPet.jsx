import "./CardPet.css";

// Mantemos os parâmetros extras para receber os dados, mas não os usaremos visualmente
const CardPet = ({
  image,
  name,
  gender,
  age,
  type,
  hasSpecialCondition,
  specialCondition,
  onClick,
}) => {
  return (
    <div className="card_pet" onClick={onClick}>
      <div className="card_img_placeholder">
        <img
          src={
            Array.isArray(image) && image[0]
              ? image[0]
              : typeof image === "string"
              ? image
              : "https://i.imgur.com/B2BFUeU.png"
          }
          alt={`Imagem de ${name}`}
        />
      </div>
      <div className="card_pet_info">
        <div className="card_pet_details">
          <span className="pet_tag">{type}</span>
          <span className="pet_tag">{gender}</span>
          <span className="pet_tag">{age}</span>
        </div>
        <h3 className="card_pet_name">{name}</h3>
      </div>
    </div>
  );
};

export default CardPet;
