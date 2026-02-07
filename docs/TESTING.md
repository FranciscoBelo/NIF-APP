# Cenários de Teste - NIF Validation App

Este documento descreve os 7 cenários de teste obrigatórios para validar o funcionamento completo da app.

## 🧪 Configuração Inicial

Antes de começar os testes:

1. Certifique-se de que a app está instalada
2. Verifique que o campo NIF aparece no checkout
3. Prepare produtos de teste com IVA configurado (23% para PT)

## 📝 Cenários de Teste

### Cenário 1: PT - NIF Particular Válido

**Objetivo**: Validar NIF de consumidor final português com formato correto

**Dados de Teste:**
- País de faturação: Portugal
- NIF: `123456789` (começa por 1, 2 ou 3)

**Passos:**
1. Adicionar produto ao carrinho
2. Ir para checkout
3. Preencher endereço de faturação em Portugal
4. No campo NIF, inserir: `123456789`
5. Aguardar validação (não deve mostrar modal)
6. Completar o checkout

**Resultados Esperados:**
- ✅ Campo aceita o NIF sem erros
- ✅ Não mostra modal de confirmação
- ✅ Checkout prossegue normalmente
- ✅ IVA mantido (23%)
- ✅ Order metafields:
  - `custom.nif` = "123456789"
  - `custom.customer_type` = "B2C"
  - `custom.vies_validated` = false
  - `custom.billing_country` = "PT"

---

### Cenário 2: PT - NIF Particular Inválido

**Objetivo**: Testar validação de formato e modal de confirmação

**Dados de Teste:**
- País de faturação: Portugal
- NIF: `12345` (menos de 9 dígitos)

**Passos:**
1. Adicionar produto ao carrinho
2. Ir para checkout
3. Preencher endereço de faturação em Portugal
4. No campo NIF, inserir: `12345`
5. Aguardar validação

**Resultados Esperados:**
- ✅ Modal aparece com título "NIF inválido"
- ✅ Mensagem: "O NIF inserido não está num formato válido. Deseja corrigir ou prosseguir como consumidor final?"
- ✅ Dois botões visíveis: "Corrigir" e "Prosseguir como consumidor final"

**Opção A - Clicar em "Corrigir":**
- ✅ Modal fecha
- ✅ Campo NIF limpo
- ✅ Mensagem de erro mostrada
- ✅ Permitir reeditar

**Opção B - Clicar em "Prosseguir como consumidor final":**
- ✅ Modal fecha
- ✅ NIF automaticamente alterado para `999999999`
- ✅ Checkout prossegue
- ✅ IVA mantido (23%)
- ✅ Order metafields:
  - `custom.nif` = "999999999"
  - `custom.customer_type` = "B2C"

---

### Cenário 3: PT - NIF Empresa Válido VIES

**Objetivo**: Validar empresa portuguesa via VIES e remover IVA

**Dados de Teste:**
- País de faturação: Portugal
- NIF: `PT507957547` ou `507957547` (NIF de empresa real)

**Passos:**
1. Adicionar produto ao carrinho (ex: €100 + IVA 23% = €123)
2. Ir para checkout
3. Preencher endereço de faturação em Portugal
4. No campo NIF, inserir: `507957547`
5. Aguardar validação VIES (pode demorar 2-5 segundos)

**Resultados Esperados:**
- ✅ Mensagem de sucesso: "✅ NIF de empresa validado via VIES"
- ✅ IVA **removido** (total = €100)
- ✅ Checkout prossegue normalmente
- ✅ Order metafields:
  - `custom.nif` = "507957547"
  - `custom.customer_type` = "B2B"
  - `custom.vies_validated` = true
  - `custom.billing_country` = "PT"
- ✅ Nota na order: "Venda B2B - IVA invertido (Reverse Charge)"

---

### Cenário 4: PT - NIF Empresa Inválido VIES

**Objetivo**: Testar fallback silencioso quando VIES falha

**Dados de Teste:**
- País de faturação: Portugal
- NIF: `599999999` (formato de empresa mas inválido no VIES)

**Passos:**
1. Adicionar produto ao carrinho
2. Ir para checkout
3. Preencher endereço de faturação em Portugal
4. No campo NIF, inserir: `599999999`
5. Aguardar validação VIES

**Resultados Esperados:**
- ✅ **Nenhuma mensagem de erro** (silencioso)
- ✅ Validação falha mas não bloqueia
- ✅ IVA **mantido** (23%)
- ✅ Checkout prossegue normalmente
- ✅ Order metafields:
  - `custom.nif` = "599999999"
  - `custom.customer_type` = "B2C"
  - `custom.vies_validated` = false

---

### Cenário 5: ES - NIF Válido VIES

**Objetivo**: Validar empresa espanhola via VIES

**Dados de Teste:**
- País de faturação: Espanha
- NIF: `ESB12345678` ou `B12345678`

**Nota:** Use um NIF de teste real ou simule. Se a validação VIES falhar, o teste ainda deve passar (fallback silencioso).

**Passos:**
1. Adicionar produto ao carrinho
2. Ir para checkout
3. Preencher endereço de faturação em **Espanha**
4. No campo NIF, inserir: `B12345678`
5. Aguardar validação VIES

**Resultados Esperados (se VIES válido):**
- ✅ Mensagem: "✅ NIF de empresa validado via VIES"
- ✅ IVA **removido**
- ✅ Order metafields:
  - `custom.customer_type` = "B2B"
  - `custom.vies_validated` = true

**Resultados Esperados (se VIES inválido):**
- ✅ Nenhuma mensagem de erro
- ✅ IVA **mantido**
- ✅ Order metafields:
  - `custom.customer_type` = "B2C"

---

### Cenário 6: DE - NIF Inválido VIES

**Objetivo**: Testar fallback para país não-português com VIES inválido

**Dados de Teste:**
- País de faturação: Alemanha
- NIF: `DE999999999` (inválido)

**Passos:**
1. Adicionar produto ao carrinho
2. Ir para checkout
3. Preencher endereço de faturação em **Alemanha**
4. No campo NIF, inserir: `999999999`
5. Aguardar validação VIES

**Resultados Esperados:**
- ✅ **Nenhuma mensagem de erro** (silencioso)
- ✅ IVA **mantido** (taxa alemã)
- ✅ Checkout prossegue
- ✅ Order metafields:
  - `custom.nif` = "999999999"
  - `custom.customer_type` = "B2C"
  - `custom.vies_validated` = false
  - `custom.billing_country` = "DE"

---

### Cenário 7: Campo Vazio

**Objetivo**: Verificar que o campo é obrigatório

**Dados de Teste:**
- País: Qualquer
- NIF: (vazio)

**Passos:**
1. Adicionar produto ao carrinho
2. Ir para checkout
3. Preencher endereço de faturação
4. Deixar campo NIF **vazio**
5. Tentar prosseguir no checkout

**Resultados Esperados:**
- ✅ Campo mostra erro: "O NIF é obrigatório"
- ✅ Checkout **bloqueado** (não permite prosseguir)
- ✅ Campo destacado em vermelho
- ✅ Só permite prosseguir após preencher

---

## 🔍 Como Verificar Metafields

Após cada teste, verifique os metafields da order:

### Via Shopify Admin

1. Vá para **Orders**
2. Abra a order criada no teste
3. Role até **Additional details**
4. Veja os metafields:
   - NIF
   - Customer Type
   - VIES Validated
   - Billing Country

### Via API (opcional)

```graphql
query {
  order(id: "gid://shopify/Order/ORDER_ID") {
    metafields(first: 10, namespace: "custom") {
      edges {
        node {
          key
          value
          type
        }
      }
    }
  }
}
```

## 📊 Checklist de Validação

Após executar todos os cenários:

- [ ] Cenário 1: NIF PT particular válido ✓
- [ ] Cenário 2: NIF PT particular inválido + modal ✓
- [ ] Cenário 3: NIF PT empresa VIES válido + IVA removido ✓
- [ ] Cenário 4: NIF PT empresa VIES inválido + silencioso ✓
- [ ] Cenário 5: NIF ES VIES válido ✓
- [ ] Cenário 6: NIF DE VIES inválido + silencioso ✓
- [ ] Cenário 7: Campo vazio bloqueia checkout ✓

## 🐛 Troubleshooting

### Modal não aparece (Cenário 2)

**Verificar:**
- País de faturação é PT?
- NIF começa por 1, 2 ou 3?
- NIF tem menos de 9 dígitos?

### VIES não valida (Cenários 3, 5)

**Possíveis causas:**
- API VIES temporariamente indisponível
- Timeout (5 segundos)
- NIF de teste inválido

**Solução:**
- Tente novamente após alguns minutos
- Use NIF de empresa real
- Verifique logs no console do navegador

### IVA não é removido (Cenário 3)

**Verificar:**
- Função está ativada em Settings > Checkout?
- Metafield `customer_type` = "B2B"?
- Verifique logs da function no Shopify CLI

## 📝 Notas Importantes

- **VIES API**: Pode ter rate limits. Aguarde entre testes.
- **Timeout**: Validações VIES podem demorar 2-5 segundos.
- **Fallback**: Se VIES falhar, app assume B2C (não bloqueia).
- **Modal**: Só aparece para NIFs PT de consumidor (1,2,3) inválidos.
- **Silencioso**: Validações VIES falhadas não mostram erro ao cliente.
