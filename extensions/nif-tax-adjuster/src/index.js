/**
 * Shopify Function: NIF Tax Adjuster
 * 
 * Ajusta impostos (IVA) baseado no tipo de cliente:
 * - B2B: Remove IVA (0%) - Inversão do Sujeito Passivo
 * - B2C: Mantém IVA normal (calculado pelo Shopify)
 * 
 * Lê cart attributes da UI Extension:
 * - customer_type: "B2B" ou "B2C"
 * - nif_number: NIF inserido
 * - vies_validated: true/false
 * - billing_country: código do país
 * 
 * Guarda order metafields para referência futura
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

  // Se é B2B, remove IVA
  if (customerType === 'B2B') {
    // Adiciona operação para remover impostos
    operations.push({
      update: {
        cartLines: input.cart.lines.map(line => ({
          id: line.id,
          taxExempt: true, // Remove impostos desta linha
        })),
      },
    });

    // Adiciona nota sobre a venda B2B
    operations.push({
      addNote: {
        message: 'Venda B2B - IVA invertido (Reverse Charge)',
      },
    });
  }

  // Prepara metafields para guardar na order
  const metafields = [
    {
      namespace: 'custom',
      key: 'nif',
      type: 'single_line_text_field',
      value: nifNumber || '',
    },
    {
      namespace: 'custom',
      key: 'customer_type',
      type: 'single_line_text_field',
      value: customerType,
    },
    {
      namespace: 'custom',
      key: 'vies_validated',
      type: 'boolean',
      value: viesValidated.toString(),
    },
    {
      namespace: 'custom',
      key: 'billing_country',
      type: 'single_line_text_field',
      value: billingCountry || '',
    },
  ];

  // Adiciona operação para guardar metafields
  operations.push({
    setMetafields: {
      metafields: metafields,
    },
  });

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
