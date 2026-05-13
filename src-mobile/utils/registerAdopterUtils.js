import { digitsOnly, validarCPF, validarSenhaForte } from "./registerOngUtils";

/**
 * Paridade com center-pet-web Login.jsx (fluxo cadastro adotante).
 * @param {{ fullName: string; cpf: string; email: string; password: string; passwordConfirm: string; agreeToTerms: boolean }} s
 */
export function validateAdopterRegister(s) {
  const errors = {};

  if (!s.agreeToTerms) {
    errors.terms = "Aceite os termos e condições para continuar.";
  }

  if (!String(s.fullName || "").trim()) errors.fullName = "Informe o nome completo.";
  if (!String(s.email || "").trim()) errors.email = "Informe o e-mail.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s.email).trim())) errors.email = "E-mail inválido.";

  const cpfD = digitsOnly(s.cpf);
  if (cpfD.length !== 11) errors.cpf = "CPF deve ter 11 dígitos.";
  else if (!validarCPF(s.cpf)) errors.cpf = "CPF inválido.";

  if (!s.password) errors.password = "Informe a senha.";
  else {
    const pv = validarSenhaForte(s.password);
    if (!pv.valido) errors.password = "Utilize uma senha forte que atenda a todos os requisitos.";
  }

  if (s.password !== s.passwordConfirm) {
    errors.passwordConfirm = "As senhas não coincidem.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function buildAdopterRegisterPayload(s) {
  return {
    fullName: String(s.fullName || "").trim(),
    email: String(s.email || "").trim(),
    password: s.password,
    cpf: digitsOnly(s.cpf),
    safeAdopter: false
  };
}

export { validarSenhaForte };
