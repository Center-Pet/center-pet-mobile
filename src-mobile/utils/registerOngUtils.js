/** Paridade com center-pet-web RegisterOng.jsx */

export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function onlyPositiveDigits(value) {
  const num = digitsOnly(value);
  return num.replace(/^0+/, "") || "";
}

export function formatCep(value) {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatCnpj(value) {
  const d = digitsOnly(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatCpf(value) {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatPhoneBr(value) {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function validarCNPJ(cnpj) {
  let c = digitsOnly(cnpj);
  if (c.length !== 14) return false;
  if (/^(\d)\1+$/.test(c)) return false;
  let tamanho = c.length - 2;
  let numeros = c.substring(0, tamanho);
  let digitos = c.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;
  tamanho += 1;
  numeros = c.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1), 10);
}

export function validarCPF(cpf) {
  let c = digitsOnly(cpf);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(c.substring(i - 1, i), 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(c.substring(9, 10), 10)) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(c.substring(i - 1, i), 10) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(c.substring(10, 11), 10);
}

export function validarSenhaForte(senha) {
  const s = senha || "";
  const comprimentoMinimo = s.length >= 8;
  const temNumero = /[0-9]/.test(s);
  const temMaiuscula = /[A-Z]/.test(s);
  const temMinuscula = /[a-z]/.test(s);
  const temCaractereEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(s);
  return {
    valido: comprimentoMinimo && temNumero && temMaiuscula && temMinuscula && temCaractereEspecial,
    comprimentoMinimo,
    temNumero,
    temMaiuscula,
    temMinuscula,
    temCaractereEspecial
  };
}

export function formatSocialMediaUrl(url, platform) {
  if (!url) return "";
  const u = String(url).trim();
  if (platform === "instagram") {
    if (u.startsWith("@")) return `https://instagram.com/${u.substring(1)}`;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.includes("instagram.com/")) {
      const username = u.split("instagram.com/")[1].split("/")[0];
      return `https://instagram.com/${username}`;
    }
    return `https://instagram.com/${u}`;
  }
  if (/^https?:\/\//i.test(u)) return u;
  if (platform === "facebook") {
    if (!u.includes(".")) return `https://facebook.com/${u}`;
  }
  if (platform === "website") {
    return u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
  }
  return `https://${u}`;
}

/**
 * @param {Record<string, any>} s estado do formulario (mesmos nomes do web)
 * @returns {{ ok: boolean; errors: Record<string, string> }}
 */
export function validateRegisterOngSubmit(s) {
  const errors = {};
  const set = (k, m) => {
    if (!errors[k]) errors[k] = m;
  };

  if (!String(s.fullName || "").trim()) set("fullName", "Informe o nome da organização.");
  if (!String(s.email || "").trim()) set("email", "Informe o e-mail.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s.email).trim())) set("email", "E-mail inválido.");

  const phoneDigits = digitsOnly(s.phone);
  if (phoneDigits.length < 10) set("phone", "Informe um telefone válido (DDD + número).");

  const cep = digitsOnly(s.zipCode);
  if (cep.length !== 8) set("zipCode", "CEP deve ter 8 dígitos.");
  if (!String(s.street || "").trim()) set("street", "Preencha o endereço após buscar o CEP.");
  if (!String(s.neighborhood || "").trim()) set("neighborhood", "Bairro obrigatório.");
  if (!String(s.city || "").trim()) set("city", "Cidade obrigatória.");
  if (!String(s.stateUf || "").trim()) set("stateUf", "UF obrigatória.");

  if (!s.noNumber) {
    const n = onlyPositiveDigits(s.number);
    if (!n) set("number", "Informe o número ou marque Sem número.");
  }

  if (!s.password) set("password", "Informe a senha.");
  else {
    const pv = validarSenhaForte(s.password);
    if (!pv.valido) set("password", "A senha deve atender a todos os requisitos de força.");
  }
  if (s.password !== s.passwordConfirm) set("passwordConfirm", "As senhas não coincidem.");

  const role = s.roleOption || "ONG";
  if (role === "ONG") {
    const c = digitsOnly(s.cnpj);
    if (c.length !== 14) set("cnpj", "Informe um CNPJ com 14 dígitos.");
    else if (!validarCNPJ(s.cnpj)) set("cnpj", "CNPJ inválido.");
  }

  if (role === "Projeto" || role === "Protetor") {
    const cpfD = digitsOnly(s.cpf);
    if (cpfD.length !== 11) set("cpf", "Informe o CPF com 11 dígitos.");
    else if (!validarCPF(s.cpf)) set("cpf", "CPF inválido.");

    const igRaw = String(s.instagram || "").trim();
    const ig = igRaw.startsWith("@") ? igRaw.slice(1).trim() : igRaw;
    const fb = String(s.facebook || "").trim();
    const ws = String(s.website || "").trim();
    if (!ig && !fb && !ws) set("social", "Informe pelo menos uma rede social (Instagram, Facebook ou site).");
  }

  if (role === "Projeto") {
    const col = onlyPositiveDigits(s.collaborators);
    if (!col || col === "0") set("collaborators", "Informe o número de colaboradores (mínimo 1).");
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function buildOngRegisterPayload(s, profileImageUrl) {
  const role = s.roleOption || "ONG";
  const formattedInstagram = formatSocialMediaUrl(s.instagram, "instagram");
  const formattedFacebook = formatSocialMediaUrl(s.facebook, "facebook");
  const formattedWebsite = formatSocialMediaUrl(s.website, "website");

  return {
    name: String(s.fullName || "").trim(),
    email: String(s.email || "").trim(),
    password: s.password,
    phone: digitsOnly(s.phone),
    description: String(s.description || "").trim(),
    address: {
      uf: s.stateUf,
      zipCode: digitsOnly(s.zipCode),
      street: String(s.street || "").trim(),
      number: s.noNumber ? "S/N" : String(onlyPositiveDigits(s.number) || "").trim(),
      neighborhood: String(s.neighborhood || "").trim(),
      city: String(s.city || "").trim(),
      state: s.stateUf
    },
    socialMedia: {
      instagram: formattedInstagram || "",
      facebook: formattedFacebook || "",
      website: formattedWebsite || ""
    },
    pixKey: String(s.pixKey || "").trim(),
    profileImage: profileImageUrl || "",
    role,
    document: {
      type: role === "ONG" ? "CNPJ" : "CPF",
      number: role === "ONG" ? digitsOnly(s.cnpj) : digitsOnly(s.cpf)
    },
    collaborators: role === "Projeto" ? parseInt(onlyPositiveDigits(s.collaborators), 10) || 0 : 0
  };
}
