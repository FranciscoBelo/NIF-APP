# Troubleshooting - NIF Validation App

Este guia ajuda a resolver problemas comuns da NIF Validation App.

## 🚨 Problemas Comuns

### 1. Campo NIF Não Aparece no Checkout

#### Sintomas
- Checkout não mostra o campo "NIF / NIPC"
- UI Extension não está visível

#### Causas Possíveis

**A) Loja não é Shopify Plus**
- Checkout UI Extensions requerem Shopify Plus
- **Solução**: Upgrade para Shopify Plus ou contactar Shopify

**B) Extensão não está ativada**
- **Verificar**:
  1. Settings > Checkout > Customize
  2. Procurar por "NIF Checkout UI" nos blocos disponíveis
- **Solução**:
  ```bash
  shopify app deploy
  ```
  Aguardar 5-10 minutos e recarregar

**C) Extensão não foi adicionada ao checkout**
- **Solução**:
  1. Settings > Checkout > Customize
  2. Clicar em "Add app block"
  3. Selecionar "NIF Checkout UI"
  4. Posicionar e salvar

**D) Cache do navegador**
- **Solução**:
  - Ctrl+Shift+R (Windows/Linux)
  - Cmd+Shift+R (Mac)
  - Ou testar em modo anônimo

---

### 2. Modal Não Aparece para NIF Inválido

#### Sintomas
- NIF português inválido (ex: 12345) não mostra modal
- Validação aceita NIFs incorretos

#### Verificações

**A) País de faturação é Portugal?**
- Modal só aparece para NIFs PT de consumidor (1,2,3)
- **Verificar**: Endereço de faturação deve ter país = Portugal

**B) NIF começa por 1, 2 ou 3?**
- Modal só para consumidor final
- Se começa por 5,6,9 → validação VIES (sem modal)
- **Solução**: Usar NIF que comece por 1,2,3

**C) NIF tem exatamente 9 dígitos?**
- Se tiver 9 dígitos, é válido (não mostra modal)
- **Testar com**: `12345` (5 dígitos) deve mostrar modal

#### Debug

Abrir console do navegador (F12) e verificar:
```javascript
// Ver mensagens de log
console.log('Validation triggered');
```

---

### 3. VIES Não Valida Empresas

#### Sintomas
- NIF de empresa não é validado
- Não mostra "✅ NIF de empresa validado via VIES"
- IVA não é removido

#### Causas Possíveis

**A) VIES API está offline**
- **Verificar**: https://ec.europa.eu/taxation_customs/vies/
- **Solução**: Aguardar restauração do serviço (app tem fallback)

**B) Timeout (5 segundos)**
- Validação demora muito
- **Solução**: Aumentar timeout em `viesApi.ts`:
  ```typescript
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
  ```

**C) NIF inválido no VIES**
- NIF pode ser formato correto mas não estar registrado
- **Verificar**: Testar NIF em https://ec.europa.eu/taxation_customs/vies/
- **Comportamento esperado**: App assume B2C (silencioso)

**D) Rate limiting**
- VIES tem limites de requisições
- **Solução**: Aguardar alguns minutos entre testes

#### Teste Manual VIES

```bash
curl -X POST https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"PT","vatNumber":"507957547"}'
```

Deve retornar:
```json
{
  "isValid": true,
  "countryCode": "PT",
  "vatNumber": "507957547"
}
```

---

### 4. IVA Não é Removido para B2B

#### Sintomas
- NIF validado via VIES
- Mensagem "✅ NIF de empresa validado"
- Mas IVA ainda aparece no total

#### Verificações

**A) Function está ativa?**
- **Verificar**:
  1. Settings > Checkout
  2. Procurar "NIF Tax Adjuster" em Checkout functions
  3. Deve estar "Active"
- **Solução**: Ativar a function

**B) Cart attributes estão sendo salvos?**
- **Debug**:
  ```bash
  shopify app dev
  ```
  Ver logs de `customer_type` = "B2B"

**C) Metafield customer_type está correto?**
- Após checkout, verificar order:
  - `custom.customer_type` deve ser "B2B"
- **Se for "B2C"**: Problema na validação VIES

**D) Function não foi deployada**
- **Solução**:
  ```bash
  cd extensions/nif-tax-adjuster
  npm run build
  cd ../..
  shopify app deploy
  ```

---

### 5. Metafields Não Aparecem nas Orders

#### Sintomas
- Orders não têm metafields custom.nif, custom.customer_type, etc.
- Additional details vazio

#### Soluções

**A) Permissões da app**
- **Verificar**: App tem scope `write_orders`?
- **Solução**: Adicionar em `shopify.app.toml`:
  ```toml
  [access_scopes]
  scopes = "write_products,write_customers,write_draft_orders,write_orders"
  ```
  Reinstalar app

**B) Function não executou**
- **Verificar logs**:
  ```bash
  shopify app dev
  ```
- **Ver**: Mensagens de erro da function

**C) Metafields não estão definidos**
- **Criar manualmente** (apenas uma vez):
  1. Settings > Custom data > Orders
  2. Add definition:
     - Namespace: `custom`
     - Key: `nif`
     - Type: Single line text

---

### 6. Traduções Não Aparecem

#### Sintomas
- Textos em inglês em vez de português
- Labels não traduzidos

#### Soluções

**A) Locale da loja**
- **Verificar**: Settings > Languages
- Deve ter Português (PT) configurado

**B) Arquivo de tradução**
- **Verificar**: `extensions/nif-checkout-ui/locales/pt.json` existe
- **Solução**: Redeploy da app

**C) Forçar locale**
- Em `Checkout.tsx`, pode forçar:
  ```typescript
  import translations from '../locales/pt.json';
  // Usar traduções diretamente
  ```

---

### 7. Campo NIF Aceita Valores Vazios

#### Sintomas
- Checkout prossegue sem NIF
- Campo não está obrigatório

#### Solução

Verificar em `NifInput.tsx`:
```typescript
<TextField
  label="NIF / NIPC"
  required // ← Deve estar presente
  value={value}
  // ...
/>
```

Se problema persistir:
- Verificar validação no checkout
- Pode precisar adicionar validação customizada

---

### 8. Performance / Lentidão

#### Sintomas
- Validação demora muito
- Checkout trava
- Timeout errors

#### Otimizações

**A) Debounce no input**
- Já implementado (800ms)
- Ajustar se necessário em `NifInput.tsx`:
  ```typescript
  const timeoutId = setTimeout(() => {
    validateNif(value);
  }, 1200); // Aumentar para 1.2s
  ```

**B) Cache VIES**
- Considerar cache local de validações
- Guardar resultado por alguns minutos

**C) Validação paralela**
- Atualmente sequencial
- Pode otimizar para validar ao mesmo tempo que preenche outros campos

---

## 🔍 Debug Avançado

### Logs no Console do Navegador

Adicionar em `NifInput.tsx`:
```typescript
console.log('NIF value:', value);
console.log('Billing country:', billingCountry);
console.log('Validation result:', viesResult);
```

### Logs da Function

Em `index.js`:
```javascript
console.log('Cart attributes:', attributes);
console.log('Customer type:', customerType);
console.log('Operations:', operations);
```

Ver logs:
```bash
shopify app dev
```

### Network Debugging

No DevTools:
1. Aba Network
2. Filtrar por "vies"
3. Ver requisições para VIES API
4. Verificar response

### Test Mode

Criar versão de teste que sempre retorna B2B:
```typescript
// Em viesApi.ts - APENAS PARA TESTE
export async function validateVies(...) {
  return {
    isValid: true, // Sempre válido
    countryCode: countryCode,
    vatNumber: vatNumber,
  };
}
```

---

## 📞 Quando Contactar Suporte

Se após tentar todas as soluções o problema persiste:

### Informações a Fornecer

1. **Versão da app**: (ex: v1.0.0)
2. **Tipo de loja**: Plus / Advanced / etc.
3. **Cenário específico**: (ex: "Cenário 3 de TESTING.md")
4. **Logs**: Cole os logs relevantes
5. **Screenshots**: Mostre o problema visual
6. **Passos para reproduzir**: Detalhe exatamente o que fez

### Recursos de Suporte

- **Documentação Shopify**: https://shopify.dev/docs
- **VIES Status**: https://ec.europa.eu/taxation_customs/vies/
- **Partner Support**: https://partners.shopify.com/support
- **Community Forums**: https://community.shopify.com/

---

## 🛠️ Ferramentas Úteis

### Testar VIES Online
- https://ec.europa.eu/taxation_customs/vies/
- Validar NIFs manualmente

### Shopify CLI
```bash
# Ver versão
shopify version

# Reiniciar dev server
shopify app dev

# Ver info da app
shopify app info

# Limpar cache
rm -rf .shopify
```

### Browser DevTools
- **Console**: Ver logs JavaScript
- **Network**: Ver requisições VIES
- **Application**: Ver LocalStorage/SessionStorage

---

## 📋 Checklist de Troubleshooting

Quando algo não funciona:

- [ ] Verificar logs no console do navegador (F12)
- [ ] Verificar logs no Shopify CLI (`shopify app dev`)
- [ ] Limpar cache do navegador
- [ ] Testar em modo anônimo
- [ ] Verificar se app está instalada
- [ ] Verificar se extensions estão ativas
- [ ] Verificar se function está deployada
- [ ] Testar com NIFs conhecidos
- [ ] Verificar status da VIES API
- [ ] Revisar documentação relevante
- [ ] Consultar este guia novamente
- [ ] Contactar suporte com informações completas

---

## ✅ Problemas Resolvidos?

Se conseguiu resolver o problema:
1. Documente a solução
2. Atualize este guia se relevante
3. Partilhe com a equipa

Se não conseguiu:
- Contactar suporte com detalhes completos
- Fornecer todos os logs e screenshots
- Descrever passos já tentados
