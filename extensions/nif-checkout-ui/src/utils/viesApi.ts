/**
 * Interface para resposta da VIES API
 */
export interface ViesValidationResult {
  isValid: boolean;
  countryCode?: string;
  vatNumber?: string;
  requestDate?: string;
  name?: string;
  address?: string;
  errorMessage?: string;
}

/**
 * Valida NIF/VAT através da VIES API da União Europeia
 * 
 * @param nif - NIF completo (pode incluir código do país)
 * @param countryCode - Código ISO do país (PT, ES, DE, etc)
 * @returns Promise com resultado da validação
 */
export async function validateVies(
  nif: string,
  countryCode: string
): Promise<ViesValidationResult> {
  try {
    // Remove espaços e prefixo do país se existir no NIF
    let vatNumber = nif.replace(/\s/g, '').replace(/^[A-Z]{2}/i, '');
    
    // Se o NIF começar com o código do país, usa esse código
    const nifCountryMatch = nif.match(/^([A-Z]{2})/i);
    if (nifCountryMatch) {
      countryCode = nifCountryMatch[1].toUpperCase();
    }
    
    // Garante que o código do país está em maiúsculas
    countryCode = countryCode.toUpperCase();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch(
      'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode: countryCode,
          vatNumber: vatNumber,
        }),
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Retry uma vez em caso de falha
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const retryResponse = await fetch(
        'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            countryCode: countryCode,
            vatNumber: vatNumber,
          }),
        }
      );
      
      if (!retryResponse.ok) {
        throw new Error(`VIES API error: ${retryResponse.status}`);
      }
      
      const retryData = await retryResponse.json();
      return {
        isValid: retryData.isValid || retryData.valid || false,
        countryCode: retryData.countryCode,
        vatNumber: retryData.vatNumber,
        requestDate: retryData.requestDate,
        name: retryData.name,
        address: retryData.address,
      };
    }
    
    const data = await response.json();
    
    return {
      isValid: data.isValid || data.valid || false,
      countryCode: data.countryCode,
      vatNumber: data.vatNumber,
      requestDate: data.requestDate,
      name: data.name,
      address: data.address,
    };
    
  } catch (error) {
    console.error('VIES validation error:', error);
    
    // Fallback: retorna inválido mas não bloqueia o checkout
    return {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Valida se um NIF precisa de validação VIES
 * - NIFs portugueses que começam por 5, 6 ou 9 precisam
 * - NIFs de outros países UE precisam
 */
export function needsViesValidation(nif: string, countryCode: string): boolean {
  const cleanNif = nif.replace(/\s/g, '').replace(/^PT/i, '');
  
  // Para Portugal, só valida VIES se for empresa (começa por 5, 6 ou 9)
  if (countryCode === 'PT') {
    const firstDigit = cleanNif.charAt(0);
    return ['5', '6', '9'].includes(firstDigit);
  }
  
  // Para outros países UE, sempre valida via VIES
  const euCountries = [
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
    'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
    'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
  ];
  
  return euCountries.includes(countryCode.toUpperCase());
}
