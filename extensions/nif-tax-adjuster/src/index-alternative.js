// NOTA IMPORTANTE SOBRE REMOÇÃO DE IVA:
//
// Shopify Functions têm limitações em modificar impostos diretamente no checkout.
// Para implementar corretamente a remoção de IVA para clientes B2B, recomendamos:
//
// OPÇÃO 1: Configuração Manual de Impostos na Loja
// - Settings > Taxes > Manage tax exemptions
// - Criar customer tags "B2B" e marcar como tax exempt
// - Depois do checkout, usar a API para tag customers B2B
//
// OPÇÃO 2: App Privada com API
// - Usar webhooks após order creation
// - Verificar metafield customer_type
// - Se B2B, fazer refund do valor do IVA via API
// - Criar draft order corrigida
//
// OPÇÃO 3: Discount Function (Requer Shopify Plus)
// - Criar discount igual ao valor do IVA para B2B
// - Funciona mas aparece como desconto, não como tax exemption
//
// Esta function marca os dados necessários nos cart attributes para
// que possam ser processados por scripts externos ou workflows.

export default function run(input) {
  const attributes = input.cart?.attributes || [];
  
  const customerType = getAttribute(attributes, 'customer_type');
  const nifNumber = getAttribute(attributes, 'nif_number');  
  const viesValidated = getAttribute(attributes, 'vies_validated') === 'true';
  const billingCountry = getAttribute(attributes, 'billing_country');

  // Marca o carrinho com informações B2B para processamento posterior
  const operations = [];
  
  if (customerType === 'B2B' && viesValidated) {
    operations.push({
      merge: {
        cartAttributes: [
          { key: '_b2b_transaction', value: 'true' },
          { key: '_nif_number', value: nifNumber || '' },
          { key: '_billing_country', value: billingCountry || '' },
          { key: '_tax_note', value: 'B2B - IVA invertido (Reverse Charge)' }
        ]
      }
    });
  }

  return { operations };
}

function getAttribute(attributes, key) {
  const attr = attributes.find(a => a.key === key);
  return attr ? attr.value : null;
}
