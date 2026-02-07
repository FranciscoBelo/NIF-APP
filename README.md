# NIF Validation App - Shopify Plus 🇵🇹

![Shopify](https://img.shields.io/badge/Shopify-Plus-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

Aplicação Shopify completa para **validação automática de NIF/NIPC** no checkout e **ajuste dinâmico de IVA** baseado no tipo de cliente (B2B vs B2C).

## 📋 Descrição

Esta app integra-se perfeitamente no checkout do Shopify Plus para:

- ✅ Validar NIFs portugueses (consumidores finais e empresas)
- ✅ Validar NIFs/VAT de toda a União Europeia via **VIES API**
- ✅ Ajustar automaticamente o IVA para transações B2B (0%)
- ✅ Manter IVA normal para consumidores finais (B2C)
- ✅ Guardar metadados completos em cada order
- ✅ Interface 100% em português

## 🎯 Features Principais

### 1. Campo NIF Obrigatório no Checkout
- Campo "NIF / NIPC" integrado nativamente
- Validação em tempo real
- Traduções completas em português
- Design consistente com o tema da loja

### 2. Validação Inteligente por País

#### 🇵🇹 Portugal
**Consumidor Final (NIF começa por 1, 2 ou 3):**
- Valida formato: exatamente 9 dígitos numéricos
- Se inválido: mostra modal com opções
  - **Corrigir**: limpa o campo para reeditar
  - **Prosseguir como consumidor final**: assume NIF 999999999
- Se válido: mantém IVA de 23%

**Empresa (NIF começa por 5, 6 ou 9):**
- Valida via **VIES API** (União Europeia)
- Se válido: ✅ Remove IVA (0%) - Inversão do Sujeito Passivo
- Se inválido: Silencioso, mantém IVA (não bloqueia checkout)

#### 🇪🇺 Outros Países da União Europeia
- Validação VIES para qualquer NIF/VAT inserido
- Se válido: Remove IVA (venda B2B intracomunitária)
- Se inválido: Mantém IVA sem avisar

### 3. Ajuste Automático de Impostos
- **Function JavaScript** processa validação
- Remove IVA para clientes B2B validados via VIES
- Mantém IVA normal para clientes B2C
- Adiciona nota: "Venda B2B - IVA invertido"

### 4. Metadados Guardados em Cada Order
Todas as orders incluem:
- `custom.nif`: NIF/NIPC inserido
- `custom.customer_type`: "B2B" ou "B2C"
- `custom.vies_validated`: true/false
- `custom.billing_country`: Código ISO do país

## 🏗️ Arquitetura

```
NIF-APP/
├── shopify.app.toml              # Configuração principal
├── package.json
├── README.md
│
├── extensions/
│   ├── nif-checkout-ui/          # UI Extension (React + TypeScript)
│   │   ├── src/
│   │   │   ├── Checkout.tsx      # Componente principal
│   │   │   ├── components/
│   │   │   │   ├── NifInput.tsx         # Campo de input com validação
│   │   │   │   ├── ConfirmModal.tsx     # Modal para NIFs inválidos
│   │   │   │   └── ValidationMessage.tsx
│   │   │   └── utils/
│   │   │       ├── nifValidator.ts      # Validação PT (9 dígitos)
│   │   │       └── viesApi.ts           # Integração VIES
│   │   └── locales/
│   │       └── pt.json           # Traduções português
│   │
│   └── nif-tax-adjuster/         # Function (JavaScript)
│       └── src/
│           ├── index.js          # Lógica de ajuste de IVA
│           └── input.graphql     # Query cart attributes
│
└── docs/
    ├── SETUP.md                  # Guia de instalação passo-a-passo
    ├── TESTING.md                # 7 cenários de teste obrigatórios
    ├── DEPLOYMENT.md             # Como fazer deploy
    └── TROUBLESHOOTING.md        # Resolução de problemas
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Shopify CLI 3.x
- Conta Shopify Partners
- **Loja Shopify Plus** (obrigatório para Checkout UI Extensions)

### Instalação Rápida

```bash
# 1. Clonar repositório
git clone <repository-url>
cd NIF-APP

# 2. Instalar dependências
npm install
cd extensions/nif-checkout-ui && npm install && cd ../..
cd extensions/nif-tax-adjuster && npm install && cd ../..

# 3. Configurar credenciais
# Edite shopify.app.toml com seu client_id

# 4. Iniciar em modo desenvolvimento
shopify app dev

# 5. Instalar na loja de desenvolvimento
# Siga as instruções no navegador
```

Para guia completo, consulte [SETUP.md](docs/SETUP.md)

## 📖 Documentação

- **[SETUP.md](docs/SETUP.md)**: Instalação completa passo-a-passo
- **[TESTING.md](docs/TESTING.md)**: 7 cenários de teste obrigatórios
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Como fazer deploy para produção
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**: Resolver problemas comuns

## 🧪 Testes

A app inclui 7 cenários de teste obrigatórios:

1. ✅ PT - NIF particular válido (123456789)
2. ✅ PT - NIF particular inválido (12345) → Modal
3. ✅ PT - NIF empresa válido VIES (PT507957547) → Remove IVA
4. ✅ PT - NIF empresa inválido VIES (599999999) → Mantém IVA
5. ✅ ES - NIF válido VIES → Remove IVA
6. ✅ DE - NIF inválido VIES → Mantém IVA
7. ✅ Campo vazio → Bloqueia checkout

Ver detalhes em [TESTING.md](docs/TESTING.md)

## 💡 Exemplos de Uso

### Exemplo 1: Cliente Particular Português
```
Cliente insere: 123456789
→ Validação: OK (9 dígitos)
→ Tipo: B2C
→ IVA: 23% (mantido)
→ Total: €123 (€100 + €23 IVA)
```

### Exemplo 2: Empresa Portuguesa Validada
```
Cliente insere: 507957547
→ Validação VIES: ✅ Válido
→ Tipo: B2B
→ IVA: 0% (removido)
→ Total: €100
→ Nota: "Venda B2B - IVA invertido"
```

### Exemplo 3: NIF Inválido PT
```
Cliente insere: 12345
→ Validação: ❌ Formato inválido
→ Modal aparece com opções:
   [Corrigir] ou [Prosseguir como consumidor final]
→ Se escolher prosseguir: NIF = 999999999, B2C
```

## 🔧 Stack Técnica

- **Framework**: Shopify App (CLI 3.x)
- **UI Extension**: React 18 + TypeScript
- **Function**: JavaScript (não Rust)
- **API Externa**: VIES REST API (União Europeia)
- **Validação**: Lado do cliente + servidor
- **Internacionalização**: Português (extensível)

## 🌍 Integração VIES

A app usa a **VIES API** oficial da União Europeia:

```
Endpoint: https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number
Método: POST
Timeout: 5 segundos
Retry: 1 tentativa
Fallback: Se API falhar, assume B2C (não bloqueia checkout)
```

**Países Suportados**: Todos os 27 estados-membros da UE

## 📊 Metadados Guardados

Cada order inclui os seguintes metafields:

| Namespace | Key | Tipo | Descrição |
|-----------|-----|------|-----------|
| `custom` | `nif` | string | NIF/NIPC inserido pelo cliente |
| `custom` | `customer_type` | string | "B2B" ou "B2C" |
| `custom` | `vies_validated` | boolean | Se foi validado via VIES |
| `custom` | `billing_country` | string | Código ISO país (PT, ES, etc) |

## ⚙️ Configuração

### Configurar no Checkout

1. **Shopify Admin** → Settings → Checkout
2. Clique em **Customize**
3. Adicione o bloco **"NIF Checkout UI"**
4. Posicione antes da informação de faturação
5. **Save**

### Ativar Function

1. **Settings** → Checkout
2. Em **Checkout functions**, ative **"NIF Tax Adjuster"**
3. Configure prioridade se necessário

## 🔒 Segurança

- ✅ Validação cliente + servidor
- ✅ Timeout em chamadas VIES (5s)
- ✅ Fallback para não bloquear checkout
- ✅ Sanitização de inputs
- ✅ Logs sem dados sensíveis
- ✅ Sem armazenamento de dados pessoais além do NIF

## 📝 Licença

MIT License - ver LICENSE file para detalhes

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie um branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para o branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **Documentação**: Ver pasta `docs/`
- **Issues**: Abrir issue neste repositório
- **VIES Status**: https://ec.europa.eu/taxation_customs/vies/

## 🎓 Recursos Adicionais

- [Shopify Checkout Extensions](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Shopify Functions](https://shopify.dev/docs/apps/checkout/delivery-customizations/run-function)
- [VIES API Documentation](https://ec.europa.eu/taxation_customs/vies/)
- [Legislação IVA Portugal](https://info.portaldasfinancas.gov.pt/)

## ⚠️ Notas Importantes

- Esta é uma **app custom/privada** (não distribuída na App Store)
- Requer **Shopify Plus** para funcionar (Checkout UI Extensions)
- VIES API é **gratuita** mas tem rate limits
- Campo NIF é **obrigatório** - bloqueia checkout se vazio
- Validações VIES falhadas são **silenciosas** (não bloqueiam)

---

**Desenvolvido com ❤️ para o mercado português** 🇵🇹

Versão: 1.0.0 | Última atualização: 2026
