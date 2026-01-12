# Configuração do Stripe - Visagio Pro

## 1. Adicionar Variáveis de Ambiente

O cliente precisa fornecer as seguintes chaves do Stripe. Adicione no arquivo `.env.local`:

```env
# Stripe Keys (OBTER DO DASHBOARD DO STRIPE)
STRIPE_SECRET_KEY=sk_test_ou_sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_ou_pk_live_...

# Price IDs (JÁ CONFIGURADOS)
STRIPE_PRICE_STANDARD=price_1SolpqFYu1W1v2i8pQtgDc9h
STRIPE_PRICE_PREMIUM=price_1SolqpFYu1W1v2i8P2F635Ii

# Webhook Secret (OBTER APÓS CONFIGURAR WEBHOOK)
STRIPE_WEBHOOK_SECRET=whsec_...

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Atualizar o Banco de Dados

Execute o script SQL no Supabase para adicionar as colunas necessárias:

```bash
# Arquivo: supabase_stripe_migration.sql
```

No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `supabase_stripe_migration.sql`
4. Clique em **Run**

## 3. Configurar Webhook no Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá em **Developers → Webhooks**
3. Clique em **Add endpoint**
4. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/webhooks/stripe`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
5. Copie o **Signing secret** (começa com `whsec_`)
6. Adicione no `.env.local` como `STRIPE_WEBHOOK_SECRET`

## 4. Testar a Integração

### Modo Test:
1. Use as chaves de teste (`sk_test_` e `pk_test_`)
2. Acesse `/pricing` logado
3. Clique em **Assinar Standard** ou **Assinar Premium**
4. Use o cartão de teste: `4242 4242 4242 4242`
   - Qualquer data futura
   - Qualquer CVV de 3 dígitos
   - Qualquer CEP

### Modo Production:
1. Troque para as chaves live (`sk_live_` e `pk_live_`)
2. Configure o webhook na produção
3. Teste com cartão real

## 5. Fluxo Completo

1. **Usuário clica em assinar** → Página Pricing
2. **Sistema cria checkout session** → API `/api/create-checkout`
3. **Usuário é redirecionado** → Stripe Checkout (página do Stripe)
4. **Usuário paga** → Stripe processa pagamento
5. **Webhook notifica sistema** → API `/api/webhooks/stripe`
6. **Sistema atualiza banco** → Tabela `profiles` com status 'standard' ou 'premium'
7. **Usuário retorna** → Dashboard com plano atualizado

## 6. Verificar Status

Para verificar se a integração está funcionando:

1. **Logs do servidor**: Verifique o console do Next.js
2. **Stripe Dashboard**: 
   - Payments → veja os pagamentos
   - Webhooks → veja os eventos recebidos
3. **Supabase**: Verifique se o `subscription_status` foi atualizado

## Chaves Necessárias do Cliente

❌ **FALTANDO** - Solicite ao cliente:
- [ ] Secret Key (`sk_test_...` ou `sk_live_...`)
- [ ] Publishable Key (`pk_test_...` ou `pk_live_...`)
- [ ] Webhook Secret (`whsec_...`) - após configurar webhook

✅ **JÁ CONFIGURADOS**:
- [x] Price ID Standard: `price_1SolpqFYu1W1v2i8pQtgDc9h`
- [x] Price ID Premium: `price_1SolqpFYu1W1v2i8P2F635Ii`

## Comandos Úteis

```bash
# Instalar dependências (já feito)
npm install stripe @stripe/stripe-js

# Testar webhook localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Rodar aplicação
npm run dev
```

## Troubleshooting

**Erro "Invalid API Key"**: 
- Verifique se o `STRIPE_SECRET_KEY` está correto no `.env.local`
- Reinicie o servidor após adicionar variáveis

**Webhook não funciona**:
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Confirme que os eventos estão selecionados no Stripe
- Veja os logs no Stripe Dashboard → Webhooks

**Plano não atualiza**:
- Verifique os logs do webhook no console
- Confirme que as colunas `stripe_customer_id` e `stripe_subscription_id` existem
- Execute novamente o script SQL se necessário
