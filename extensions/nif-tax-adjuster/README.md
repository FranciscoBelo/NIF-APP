# NIF Tax Adjuster Function

Esta função do Shopify ajusta automaticamente os impostos (IVA) no checkout baseado no tipo de cliente determinado pela validação de NIF.

## Funcionamento

### Input
A função lê os seguintes **cart attributes** definidos pela UI Extension:

- `customer_type`: "B2B" ou "B2C"
- `nif_number`: NIF inserido pelo cliente
- `vies_validated`: "true" ou "false" (validação VIES)
- `billing_country`: Código ISO do país de faturação

### Lógica

**B2B (Empresa validada via VIES):**
- Remove IVA completamente (0%)
- Adiciona nota: "Venda B2B - IVA invertido (Reverse Charge)"
- Aplica regime de inversão do sujeito passivo

**B2C (Consumidor final):**
- Mantém IVA normal
- Shopify calcula automaticamente baseado nas regras de impostos

### Output

A função executa as seguintes operações:

1. **Ajuste de impostos**: Remove ou mantém IVA
2. **Guardar metafields**: Salva informações na order
   - `custom.nif`: NIF inserido
   - `custom.customer_type`: "B2B" ou "B2C"
   - `custom.vies_validated`: true/false
   - `custom.billing_country`: Código do país

## Instalação

A função é automaticamente implantada com a app através do Shopify CLI:

```bash
npm run deploy
```

## Ativação

1. No Shopify Admin, vá para **Settings > Checkout**
2. Na seção **Checkout Functions**, ative a função "nif-tax-adjuster"
3. Configure a prioridade se necessário

## Verificação

Após uma compra, você pode verificar os metafields da order:

1. Vá para **Orders** no Shopify Admin
2. Abra uma order
3. Na seção **Additional details**, veja os metafields customizados

## Troubleshooting

### Função não está removendo IVA
- Verifique se `customer_type` = "B2B" nos cart attributes
- Confirme que a função está ativada no Admin
- Revise os logs da função no Shopify CLI

### Metafields não aparecem
- Confirme que a função está em execução
- Verifique se os cart attributes estão sendo definidos pela UI Extension
- Revise as permissões da app (write_orders)
