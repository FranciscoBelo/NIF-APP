# Implementação de Remoção de IVA B2B

## ⚠️ Limitação Importante

As **Shopify Checkout Functions** atualmente **NÃO permitem modificar impostos diretamente** no checkout de forma automática. Esta é uma limitação da plataforma Shopify, não da nossa app.

## 🔧 Soluções Disponíveis

### Solução 1: Customer Tags + Tax Exemption (RECOMENDADA)

Esta é a solução mais limpa e nativa do Shopify.

#### Configuração:

1. **Criar Customer Group para B2B**:
   - No Shopify Admin: Customers > Groups
   - Criar grupo "B2B Clientes"
   - Ativar "Tax exempt"

2. **Criar Script/Webhook**:
   Após a order ser criada, verificar metafields e adicionar tag:

```javascript
// Webhook: orders/create
if (order.metafields.custom.customer_type === 'B2B') {
  // Adicionar customer ao grupo B2B
  // Refund do IVA cobrado
  // Criar nota na order
}
```

#### Vantagens:
- ✅ Solução nativa do Shopify
- ✅ Historicamente correto
- ✅ Relatórios precisos

#### Desvantagens:
- ⚠️ IVA cobrado inicialmente, depois reembolsado
- ⚠️ Requer processamento pós-order

---

### Solução 2: Discount Function Equivalente

Criar desconto automático igual ao valor do IVA.

#### Configuração:

Criar Discount Function que:
- Lê `customer_type = B2B` dos cart attributes
- Calcula valor do IVA (ex: 23% de €100 = €23)
- Cria desconto de €23 com nome "IVA B2B Isento"

#### Código Example:

```javascript
// discount-function/src/index.js
export default function run(input) {
  const customerType = getCartAttribute(input.cart, 'customer_type');
  
  if (customerType !== 'B2B') {
    return { operations: [] };
  }
  
  // Calcular desconto equivalente ao IVA
  const taxRate = 0.23; // 23% Portugal
  const subtotal = calculateSubtotal(input.cart.lines);
  const taxAmount = subtotal * taxRate;
  
  return {
    operations: [{
      discount: {
        value: {
          fixedAmount: {
            amount: taxAmount
          }
        },
        title: "Isento IVA B2B (Reverse Charge)"
      }
    }]
  };
}
```

#### Vantagens:
- ✅ Funciona em tempo real no checkout
- ✅ Cliente vê preço correto imediatamente

#### Desvantagens:
- ⚠️ Aparece como "desconto" não como tax exemption
- ⚠️ Pode confundir relatórios de impostos
- ⚠️ Requer cálculo manual da taxa

---

### Solução 3: Produtos Duplicados (Não Recomendada)

Criar versões duplicadas de produtos sem IVA.

#### Como funciona:
- Produto A: Para B2C (com IVA)
- Produto A B2B: Para B2B (sem IVA)
- Script redireciona B2B para versão sem IVA

#### Vantagens:
- ✅ Funciona nativamente

#### Desvantagens:
- ❌ Muito trabalhoso
- ❌ Difícil manutenção
- ❌ Duplicação de inventário

---

### Solução 4: Script Externo + API (Avançada)

Processar via API externa após checkout.

#### Fluxo:
1. Cliente completa checkout com IVA
2. Webhook `orders/create` → Seu servidor
3. Servidor verifica `customer_type = B2B`
4. API Shopify: Cria refund do IVA
5. API Shopify: Adiciona nota na order

#### Código Example:

```javascript
// webhook-handler.js
app.post('/webhooks/orders-create', async (req, res) => {
  const order = req.body;
  
  // Verificar metafields
  const metafields = await getOrderMetafields(order.id);
  const customerType = metafields.find(m => m.key === 'customer_type');
  
  if (customerType?.value === 'B2B') {
    // Calcular IVA
    const taxAmount = order.total_tax;
    
    // Criar refund
    await createRefund(order.id, {
      amount: taxAmount,
      reason: 'B2B Tax Exemption - Reverse Charge',
      note: `NIF: ${metafields.find(m => m.key === 'nif')?.value}`
    });
    
    // Adicionar nota
    await addOrderNote(order.id, 
      'Venda B2B - IVA invertido conforme legislação EU'
    );
  }
  
  res.sendStatus(200);
});
```

#### Vantagens:
- ✅ Controle total
- ✅ Pode integrar com contabilidade
- ✅ Flexível

#### Desvantagens:
- ⚠️ Requer servidor próprio
- ⚠️ Complexo de implementar
- ⚠️ IVA cobrado inicialmente

---

## 🎯 Nossa Recomendação

Para implementação imediata e funcional, recomendamos **Solução 1 + Solução 4**:

### Fase 1: Manual (Imediato)
1. App coleta e valida NIF
2. Guarda metafields nas orders
3. Manualmente, você processa orders B2B:
   - Filtra orders por `customer_type = B2B`
   - Faz refund do IVA
   - Adiciona nota fiscal

### Fase 2: Automatizada (Próxima versão)
1. Implementar webhook handler
2. Automatizar refunds de IVA
3. Integrar com contabilidade

## 📋 O Que a App Atual Faz

Nossa app **NÃO remove automaticamente o IVA**, mas fornece todos os dados necessários:

✅ **O que funciona:**
- Campo NIF obrigatório no checkout
- Validação Portugal (1,2,3 → 9 dígitos)
- Validação VIES (5,6,9 e outros países UE)
- Modal para NIFs inválidos
- Guarda metafields em todas orders:
  - `custom.nif`
  - `custom.customer_type` (B2B/B2C)
  - `custom.vies_validated`
  - `custom.billing_country`
- Marca cart attributes para processamento

❌ **O que NÃO funciona:**
- Remoção automática de IVA no checkout
- Desconto automático para B2B
- Tax exemption em tempo real

## 🔄 Workflow Atual Recomendado

### Para Cliente B2C:
1. ✅ Insere NIF → Valida
2. ✅ Completa checkout com IVA (23%)
3. ✅ Order criada normalmente

### Para Cliente B2B:
1. ✅ Insere NIF empresa → Valida VIES
2. ✅ Vê mensagem "NIF de empresa validado"
3. ⚠️ Completa checkout **COM IVA** (limitação Shopify)
4. ✅ Order criada com metafield `customer_type = B2B`
5. 🔧 **Você processa**: Faz refund do IVA manualmente ou via script

## 📞 Próximos Passos

Se precisa de remoção automática de IVA, podemos desenvolver:

1. **Webhook Handler** (Solução 4)
2. **Discount Function** (Solução 2)
3. **Customer Group Automation** (Solução 1)

Contacte-nos para discutir qual solução melhor se adequa ao seu caso.

## 📚 Recursos

- [Shopify Tax Settings](https://help.shopify.com/en/manual/taxes)
- [Shopify Functions Limitations](https://shopify.dev/docs/apps/checkout/best-practices/customizations)
- [VIES VAT Information](https://ec.europa.eu/taxation_customs/vies/)
