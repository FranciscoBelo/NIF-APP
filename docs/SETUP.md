# NIF Validation App - Guia de Instalação

Este guia fornece instruções passo-a-passo para instalar e configurar a Shopify App de validação de NIF.

## 📋 Pré-requisitos

### Requisitos do Sistema
- **Node.js**: versão 18.0.0 ou superior
- **npm**: versão 9.0.0 ou superior
- **Shopify CLI**: versão 3.x
- **Conta Shopify Partners**: Para criar a app
- **Loja Shopify Plus**: Checkout UI Extensions requerem Shopify Plus

### Verificar Instalações

```bash
node --version  # Deve ser >= 18.0.0
npm --version   # Deve ser >= 9.0.0
shopify version # Deve ser >= 3.0.0
```

### Instalar Shopify CLI

Se ainda não tem o Shopify CLI instalado:

```bash
npm install -g @shopify/cli @shopify/app
```

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone <repository-url>
cd NIF-APP
```

### 2. Instalar Dependências

```bash
# Dependências principais
npm install

# Dependências da UI Extension
cd extensions/nif-checkout-ui
npm install
cd ../..

# Dependências da Function
cd extensions/nif-tax-adjuster
npm install
cd ../..
```

### 3. Configurar Shopify Partners

#### 3.1 Criar App no Partner Dashboard

1. Acesse [Shopify Partners](https://partners.shopify.com/)
2. Vá para **Apps** > **Create app**
3. Escolha **Create app manually**
4. Preencha:
   - **App name**: NIF Validation App
   - **App URL**: https://seu-dominio.com (temporário)
   - **Allowed redirection URL(s)**: 
     - https://seu-dominio.com/auth/callback
     - https://seu-dominio.com/api/auth/callback

#### 3.2 Obter Credenciais

Após criar a app:
1. Copie o **Client ID**
2. Copie o **Client Secret** (guarde com segurança)

### 4. Configurar shopify.app.toml

Edite o arquivo `shopify.app.toml` na raiz do projeto:

```toml
name = "nif-validation-app"
client_id = "SEU_CLIENT_ID_AQUI"
application_url = "https://seu-dominio.com"

[build]
dev_store_url = "sua-loja-dev.myshopify.com"
```

### 5. Autenticar com Shopify

```bash
shopify auth login
```

Siga as instruções no navegador para autenticar.

### 6. Conectar a uma Loja de Desenvolvimento

```bash
shopify app dev
```

Este comando:
- Inicia o servidor de desenvolvimento
- Cria um tunnel para testar localmente
- Abre o navegador para instalar a app na sua loja dev

### 7. Instalar a App na Loja

1. No navegador, selecione sua loja de desenvolvimento
2. Clique em **Install app**
3. Revise as permissões solicitadas
4. Clique em **Install**

## ⚙️ Configuração no Shopify Admin

### 1. Configurar Checkout

1. No Shopify Admin, vá para **Settings** > **Checkout**
2. Na seção **Checkout editor**, clique em **Customize**
3. No editor:
   - Clique em **Add app block**
   - Selecione **NIF Checkout UI**
   - Posicione o bloco antes/junto à informação de faturação
   - Clique em **Save**

### 2. Ativar Checkout Function

1. Ainda em **Settings** > **Checkout**
2. Role até **Checkout functions**
3. Encontre **NIF Tax Adjuster**
4. Clique em **Activate**
5. Configure a prioridade se houver outras functions

### 3. Configurar Impostos

1. Vá para **Settings** > **Taxes and duties**
2. Configure as taxas de IVA para Portugal (23%)
3. Configure outras taxas da UE conforme necessário
4. Ative **Charge tax on this product** para todos os produtos

### 4. Configurar Metafields

Os metafields são criados automaticamente, mas você pode visualizá-los:

1. Vá para **Settings** > **Custom data**
2. Selecione **Orders**
3. Verifique que existem os seguintes metafields:
   - `custom.nif`
   - `custom.customer_type`
   - `custom.vies_validated`
   - `custom.billing_country`

## 🧪 Testar a Instalação

### Teste Rápido

1. Acesse o checkout da sua loja
2. Verifique se o campo "NIF / NIPC" aparece
3. Insira um NIF de teste: `123456789`
4. Complete o checkout
5. Verifique a order criada - deve ter os metafields

### Testes Completos

Consulte o arquivo `TESTING.md` para cenários detalhados de teste.

## 🔧 Troubleshooting

### Erro: "App não aparece no Checkout Editor"

**Solução:**
```bash
shopify app deploy
```
Aguarde alguns minutos e recarregue o editor.

### Erro: "Function não está ativa"

**Solução:**
1. Vá para Settings > Checkout
2. Verifique se a function está listada
3. Se não estiver, execute: `shopify app deploy`

### Erro: "VIES API não responde"

**Solução:**
- A API VIES pode estar temporariamente indisponível
- A app tem fallback automático (assume B2C)
- Teste novamente após alguns minutos

### Campo NIF não aparece no checkout

**Solução:**
1. Confirme que a loja é Shopify Plus
2. Verifique se a extensão está ativada no Checkout Editor
3. Limpe o cache do navegador
4. Tente em modo anônimo/privado

## 📞 Suporte

Para problemas não resolvidos:

1. Verifique os logs no Shopify CLI: `shopify app dev`
2. Consulte `TROUBLESHOOTING.md`
3. Revise a documentação oficial: https://shopify.dev/docs/apps

## ✅ Próximos Passos

Após instalação bem-sucedida:

1. Execute os testes em `TESTING.md`
2. Configure traduções adicionais se necessário
3. Ajuste estilos no Checkout Editor
4. Prepare para deploy em produção (consulte `DEPLOYMENT.md`)
