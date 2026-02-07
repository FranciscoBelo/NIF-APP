/**
 * Shopify Function: NIF Tax Adjuster
 * 
 * Marca linhas do carrinho para isenção de impostos baseado no tipo de cliente:
 * - B2B: Marca produtos como tax-exempt
 * - B2C: Mantém tributação normal
 * 
 * Lê cart attributes da UI Extension:
 * - customer_type: "B2B" ou "B2C"
 * - nif_number: NIF inserido
 * - vies_validated: true/false
 * - billing_country: código do país
 * 
 * NOTA: Esta função usa cart-transform para marcar itens como tax-exempt.
 * Para funcionar corretamente, a loja deve ter configuração de tax exemption ativa.
 */

// @ts-check

/**
 * @typedef {import("../generated/api").InputQuery} InputQuery
 * @typedef {import("../generated/api").FunctionResult} FunctionResult
 */

/**
 * @type {FunctionResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * Função principal executada pelo Shopify no checkout
 * @param {InputQuery} input
 * @returns {FunctionResult}
 */
export default function run(input) {
  // Lê cart attributes da UI Extension
  const attributes = input.cart?.attributes || [];
  
  const customerType = getAttributeValue(attributes, 'customer_type');
  const nifNumber = getAttributeValue(attributes, 'nif_number');
  const viesValidated = getAttributeValue(attributes, 'vies_validated') === 'true';
  const billingCountry = getAttributeValue(attributes, 'billing_country');

  // Se não há tipo de cliente definido, não faz alterações
  if (!customerType) {
    return NO_CHANGES;
  }

  const operations = [];

  // Se é B2B, adiciona atributos às linhas para marcá-las como tax-exempt
  // NOTA: A implementação real de tax exemption depende das configurações
  // da loja Shopify. Esta function prepara os dados necessários.
  if (customerType === 'B2B' && viesValidated) {
    // Adiciona metadados que podem ser usados por outras functions ou apps
    // A remoção efetiva do IVA deve ser configurada via:
    // 1. Tax settings da loja para clientes B2B
    // 2. Customer tags/groups com tax exemption
    // 3. Manual handling no admin
    
    operations.push({
      merge: {
        cartAttributes: [
          {
            key: '_b2b_transaction',
            value: 'true'
          },
          {
            key: '_tax_exempt_reason',
            value: 'VIES validated B2B - Reverse Charge'
          }
        ]
      }
    });
  }

  return {
    operations: operations,
  };
}

/**
 * Função auxiliar para obter valor de um atributo
 * @param {Array} attributes
 * @param {string} key
 * @returns {string|null}
 */
function getAttributeValue(attributes, key) {
  const attribute = attributes.find(attr => attr.key === key);
  return attribute ? attribute.value : null;
}
