export async function fetchUfList() {
  const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
  if (!response.ok) throw new Error("Nao foi possivel carregar estados.");
  return response.json();
}

export async function fetchCityList(uf) {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  if (!response.ok) throw new Error("Nao foi possivel carregar cidades.");
  return response.json();
}

export async function lookupCep(cep) {
  const sanitized = cep.replace(/\D/g, "");
  const response = await fetch(`https://viacep.com.br/ws/${sanitized}/json/`);
  if (!response.ok) throw new Error("Nao foi possivel consultar o CEP.");
  return response.json();
}
