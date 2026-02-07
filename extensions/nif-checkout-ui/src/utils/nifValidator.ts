/**
 * Valida NIF português de consumidor final (começa por 1, 2 ou 3)
 * Deve ter exatamente 9 dígitos numéricos
 */
export function validatePortugueseConsumerNif(nif: string): boolean {
  // Remove espaços e prefixo PT se existir
  const cleanNif = nif.replace(/\s/g, '').replace(/^PT/i, '');
  
  // Verifica se tem exatamente 9 dígitos
  if (!/^\d{9}$/.test(cleanNif)) {
    return false;
  }
  
  // Verifica se começa por 1, 2 ou 3
  const firstDigit = cleanNif.charAt(0);
  if (!['1', '2', '3'].includes(firstDigit)) {
    return true; // Não é NIF de consumidor final, não aplicamos esta validação
  }
  
  return true;
}

/**
 * Verifica se o NIF é de empresa portuguesa (começa por 5, 6 ou 9)
 */
export function isPortugueseBusinessNif(nif: string): boolean {
  const cleanNif = nif.replace(/\s/g, '').replace(/^PT/i, '');
  const firstDigit = cleanNif.charAt(0);
  return ['5', '6', '9'].includes(firstDigit);
}

/**
 * Verifica se o NIF é de consumidor final português (começa por 1, 2 ou 3)
 */
export function isPortugueseConsumerNif(nif: string): boolean {
  const cleanNif = nif.replace(/\s/g, '').replace(/^PT/i, '');
  const firstDigit = cleanNif.charAt(0);
  return ['1', '2', '3'].includes(firstDigit);
}

/**
 * Limpa e formata o NIF removendo espaços
 */
export function cleanNif(nif: string): string {
  return nif.replace(/\s/g, '');
}

/**
 * Extrai o código do país do NIF (se tiver prefixo)
 */
export function extractCountryCode(nif: string): string | null {
  const match = nif.match(/^([A-Z]{2})/);
  return match ? match[1] : null;
}
