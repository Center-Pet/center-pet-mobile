import CardPet from "../../Molecules/CardPet/CardPet";
import { useNavigate } from "react-router-dom";
import "./PagePet.css";

const PagePet = ({ title, pets }) => {
  const navigate = useNavigate();

  return (
    <div className="page-pet-container">
      <h2 className="page-pet-title">{title}</h2>
      <div className="page-pet-grid">
        {pets.map((pet) => (
          <CardPet
            key={pet.id}
            image={pet.image}
            name={pet.name}
            gender={pet.gender}
            age={pet.age}
            onClick={() => navigate(`/pet-info/${pet.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default PagePet;
