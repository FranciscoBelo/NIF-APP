# NIF Tax Adjuster Function

Esta função do Shopify marca transações B2B para processamento de isenção de IVA.

## ⚠️ Limitação Importante

**Shopify Checkout Functions não podem remover IVA automaticamente**. Esta é uma limitação da plataforma, não da nossa app.

Esta function prepara os dados necessários para que o IVA possa ser processado posteriormente via:
- Refund automático (webhook)
- Configuração de customer groups
- Processamento manual

Ver `docs/TAX_IMPLEMENTATION.md` para soluções completas.

## Funcionamento

### Input
A função lê os seguintes **cart attributes** definidos pela UI Extension:

- `customer_type`: "B2B" ou "B2C"
- `nif_number`: NIF inserido pelo cliente
- `vies_validated`: "true" ou "false" (validação VIES)
- `billing_country`: Código ISO do país de faturação

### Output

A função adiciona **cart attributes** adicionais para marcação:

- `_b2b_transaction`: "true" (se B2B validado)
- `_tax_note`: "B2B - IVA invertido (Reverse Charge)"

Estes attributes ficam disponíveis na order e podem ser usados por:
- Webhooks para processar refund
- Scripts externos
- Outros workflows

## O Que Esta Function FAZ

✅ Marca transações B2B validadas via VIES  
✅ Adiciona informações para processamento posterior  
✅ Disponibiliza dados nos attributes da order  

## O Que Esta Function NÃO FAZ

❌ Não remove IVA automaticamente no checkout  
❌ Não cria descontos  
❌ Não modifica preços  

## Processamento Pós-Checkout

Para remover o IVA, você deve:

### Opção 1: Webhook (Automático)
```javascript
// orders/create webhook
if (order.attributes._b2b_transaction === 'true') {
  // Refund do IVA
  createRefund(order.id, order.total_tax);
}
```

### Opção 2: Manual
1. Filtrar orders com `customer_type = B2B`
2. Fazer refund do valor do IVA
3. Adicionar nota fiscal

Ver documentação completa em `docs/TAX_IMPLEMENTATION.md`

## Instalação

A função é automaticamente implantada com a app:

```bash
npm run deploy
```

## Ativação

1. No Shopify Admin, vá para **Settings > Checkout**
2. Na seção **Checkout Functions**, ative a função "nif-tax-adjuster"

## Verificação

Após uma compra, verifique os attributes da order no Admin ou via API.

