
export default function CardPet({ nome, genero, idade, imagem }) {
  return (
    <div className="card-info">
      <div className="card-info-image-container">
        <img src={imagem || "/placeholder.svg"} alt={nome} className="card-info-image" />
      </div>
      <div className="card-info-info">
        <h3 className="card-info-title">{nome}</h3>
        <p className="card-info-detail">Gênero: {genero}</p>
        <p className="card-info-detail">Idade: {idade}</p>
      </div>
    </div>
  )
}
