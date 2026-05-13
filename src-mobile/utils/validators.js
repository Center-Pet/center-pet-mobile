export function isValidEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export function validateCPF(cpf) {
  const normalized = cpf.replace(/[^\d]+/g, "");
  if (normalized.length !== 11 || /^(\d)\1+$/.test(normalized)) return false;
  let sum = 0;
  for (let i = 1; i <= 9; i += 1) sum += Number(normalized.substring(i - 1, i)) * (11 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== Number(normalized.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i += 1) sum += Number(normalized.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === Number(normalized.substring(10, 11));
}

export function validateStrongPassword(password) {
  return {
    minLength: password.length >= 8,
    number: /[0-9]/.test(password),
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  };
}

export function isStrongPassword(password) {
  const checks = validateStrongPassword(password);
  return Object.values(checks).every(Boolean);
}
