# Guia de Deploy - NIF Validation App

Este guia explica como fazer deploy da app para produção.

## 📋 Pré-requisitos

Antes de fazer deploy:

- [ ] Todos os testes em `TESTING.md` foram executados
- [ ] App funciona corretamente em loja de desenvolvimento
- [ ] Credenciais de produção configuradas
- [ ] Loja de produção é Shopify Plus
- [ ] Backup da loja de produção realizado

## 🚀 Deploy para Produção

### 1. Preparar o Build

```bash
# Na raiz do projeto
cd /path/to/NIF-APP

# Limpar builds anteriores
rm -rf extensions/*/dist

# Build da UI Extension
cd extensions/nif-checkout-ui
npm run build
cd ../..

# Build da Function
cd extensions/nif-tax-adjuster
npm run build
cd ../..
```

### 2. Validar Configurações

Verifique o arquivo `shopify.app.toml`:

```toml
name = "nif-validation-app"
client_id = "SEU_CLIENT_ID_PRODUCAO"
application_url = "https://seu-dominio-producao.com"

[access_scopes]
scopes = "write_products,write_customers,write_draft_orders,write_orders,read_checkouts"
```

### 3. Deploy via Shopify CLI

```bash
# Autenticar (se necessário)
shopify auth login

# Deploy da app completa
shopify app deploy
```

Siga as instruções:
1. Confirme a versão a ser deployada
2. Selecione a app no Partner Dashboard
3. Aguarde a conclusão do upload

### 4. Criar Versão no Partner Dashboard

1. Acesse [Shopify Partners](https://partners.shopify.com/)
2. Vá para **Apps** > Sua app
3. Clique em **Versions**
4. Clique em **Create version**
5. Preencha:
   - **Version name**: v1.0.0
   - **Description**: Versão inicial com validação NIF e ajuste IVA
6. Clique em **Create**

## 🏪 Instalar na Loja de Produção

### 1. Gerar Link de Instalação

No Partner Dashboard:
1. Vá para **Test your app**
2. Selecione a loja de produção
3. Ou copie o link de instalação

### 2. Instalar na Loja

1. Abra o link de instalação
2. Faça login como proprietário da loja
3. Revise as permissões
4. Clique em **Install app**

### 3. Configurar Checkout

#### 3.1 Adicionar UI Extension

1. No Shopify Admin, vá para **Settings** > **Checkout**
2. Clique em **Customize** no Checkout editor
3. No painel esquerdo:
   - Clique em **Add app block**
   - Selecione **NIF Checkout UI**
4. Posicione o bloco:
   - Arraste para antes/junto à seção de faturação
   - Recomendado: Logo após o email
5. Clique em **Save**

#### 3.2 Ativar Function

1. Ainda em **Settings** > **Checkout**
2. Role até **Checkout functions**
3. Encontre **NIF Tax Adjuster**
4. Toggle para **Active**
5. Configure prioridade:
   - Se houver outras functions, defina ordem apropriada
   - NIF Tax Adjuster deve executar após validações de endereço

### 4. Configurar Impostos

Verifique configurações de impostos:

1. **Settings** > **Taxes and duties**
2. Para Portugal:
   - Taxa padrão: 23%
   - Taxa reduzida: 6% ou 13% (se aplicável)
3. Para outros países UE:
   - Configure conforme legislação local
4. Ative **Charge tax on this product** para produtos relevantes

## ✅ Validação Pós-Deploy

### Checklist de Validação

- [ ] **UI Extension visível no checkout**
  - Campo NIF aparece
  - Traduções em português corretas
  - Campo obrigatório funciona

- [ ] **Validação PT funciona**
  - Teste NIF particular válido (123456789)
  - Teste NIF particular inválido (12345) - modal aparece
  - Teste NIF empresa VIES (507957547)

- [ ] **Validação UE funciona**
  - Teste NIF de outro país UE
  - Validação VIES executa

- [ ] **Function ativa**
  - IVA removido para B2B
  - IVA mantido para B2C
  - Metafields salvos nas orders

- [ ] **Performance**
  - Validação não demora mais de 5 segundos
  - Checkout não trava
  - VIES timeout funciona

### Teste de Produção

Execute pelo menos os cenários 1, 2 e 3 de `TESTING.md` em produção:

1. **Cenário 1**: NIF PT válido (B2C)
2. **Cenário 2**: NIF PT inválido (modal)
3. **Cenário 3**: NIF empresa VIES (B2B sem IVA)

## 📊 Monitoramento

### 1. Verificar Logs

```bash
# Iniciar modo dev para ver logs
shopify app dev

# Logs aparecem no terminal
```

### 2. Monitorar Errors

No Partner Dashboard:
1. Vá para **Analytics** > **Error reports**
2. Verifique erros das últimas 24h
3. Investigue falhas da function ou extensão

### 3. Verificar Orders

Após primeiras vendas:
1. **Orders** no Shopify Admin
2. Abra 5-10 orders recentes
3. Verifique metafields:
   - `custom.nif` preenchido
   - `custom.customer_type` correto
   - `custom.vies_validated` apropriado

## 🔄 Atualizações Futuras

### Criar Nova Versão

Quando fizer alterações:

```bash
# 1. Fazer alterações no código
# 2. Testar em dev
shopify app dev

# 3. Build
npm run build

# 4. Deploy nova versão
shopify app deploy

# 5. Criar versão no Partner Dashboard
# 6. Atualizar na loja de produção (automático ou manual)
```

### Rollback

Se houver problemas:

1. No Partner Dashboard > **Versions**
2. Selecione versão anterior estável
3. Clique em **Make current**
4. A loja reverterá automaticamente

## 🔧 Configurar no Checkout Editor

### Posicionamento Recomendado

```
Checkout
├── Contact information
├── Email
├── **→ NIF / NIPC** ← ADICIONAR AQUI
├── Shipping address
├── Billing address
├── Shipping method
└── Payment
```

### Customização Visual

No Checkout Editor, você pode:

1. Ajustar espaçamento
2. Alterar cor do campo (seguir tema)
3. Adicionar texto de ajuda
4. Configurar ordem de campos

### Configurações Avançadas

Para ajustes finos, edite `Checkout.tsx`:

```typescript
// Exemplo: Adicionar placeholder customizado
<TextField
  label="NIF / NIPC"
  placeholder="Insira o seu NIF ou NIPC"
  // ...
/>
```

Depois, redeploy:
```bash
shopify app deploy
```

## 🌐 Configurar Domínio Personalizado (Opcional)

Se quiser domínio próprio para a app:

1. No Partner Dashboard > **App setup**
2. Em **URLs**, adicione:
   - **App URL**: https://nif-app.seu-dominio.com
   - **Allowed redirection URLs**: 
     - https://nif-app.seu-dominio.com/auth/callback
3. Configure DNS para apontar para seu servidor
4. Atualize `shopify.app.toml`

## 📞 Suporte Pós-Deploy

### Recursos

- **Documentação**: Revisar `TROUBLESHOOTING.md`
- **Shopify Support**: Para problemas da plataforma
- **Partner Support**: Para problemas da app
- **VIES Status**: https://ec.europa.eu/taxation_customs/vies/

### Contatos

- **Suporte Técnico**: [seu email]
- **Partner Dashboard**: https://partners.shopify.com
- **Shopify Help**: https://help.shopify.com

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] App instalada na loja de produção
- [ ] UI Extension ativa no checkout
- [ ] Function ativa e funcionando
- [ ] Testes de validação passaram
- [ ] Metafields sendo salvos
- [ ] IVA ajustado corretamente para B2B
- [ ] Modal funciona para NIFs inválidos
- [ ] VIES validando empresas
- [ ] Documentação atualizada
- [ ] Time treinado no funcionamento
- [ ] Monitoramento configurado

## 🎉 Deploy Concluído!

Parabéns! Sua NIF Validation App está agora em produção.

**Próximos passos:**
1. Monitorar primeiras transações
2. Coletar feedback dos clientes
3. Ajustar conforme necessário
4. Manter documentação atualizada
