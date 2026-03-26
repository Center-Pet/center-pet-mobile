// Função para gerar slug a partir de um nome
export default function slugify(str) {
  return str
    .toString()
    .normalize('NFD') // Remove acentos
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Substitui tudo que não for letra ou número por hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim
} 