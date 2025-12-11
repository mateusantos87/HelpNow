# Configuração do Stripe - HelpNow

## Visão Geral

O Stripe será usado para processar pagamentos de forma segura no HelpNow, incluindo:
- Cartões de crédito/débito
- Apple Pay
- Google Pay
- Transferências para profissionais (Stripe Connect)

## Pré-requisitos

- Conta no [Stripe](https://stripe.com/)
- Documento de identidade (para verificação)
- Conta bancária (para receber pagamentos da plataforma)

## Passo 1: Criar Conta Stripe

1. Acesse [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Preencha:
   - **E-mail**
   - **Nome completo**
   - **País:** Portugal (ou seu país)
   - **Senha**
3. Confirme o e-mail
4. Complete o perfil da empresa:
   - **Nome da empresa:** HelpNow
   - **Tipo:** Plataforma/Marketplace
   - **Website:** (quando disponível)
   - **Descrição:** Marketplace de serviços profissionais

## Passo 2: Ativar Modo de Teste

Por padrão, você começa no **modo de teste**. Isso permite:
- Testar pagamentos sem cobrar cartões reais
- Usar cartões de teste
- Desenvolver e testar webhooks

### Cartões de Teste

```
Cartão de Sucesso:
  Número: 4242 4242 4242 4242
  Data: Qualquer data futura
  CVC: Qualquer 3 dígitos
  ZIP: Qualquer 5 dígitos

Cartão que Requer Autenticação (3D Secure):
  Número: 4000 0025 0000 3155

Cartão que Falha:
  Número: 4000 0000 0000 0002
```

Mais cartões de teste: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Passo 3: Obter API Keys

1. No Dashboard, vá em **"Developers" → "API keys"**
2. Você verá 4 keys:
   - **Publishable key (test):** `pk_test_...` → Usado no frontend
   - **Secret key (test):** `sk_test_...` → Usado no backend (NUNCA exponha!)
   - **Publishable key (live):** `pk_live_...`
   - **Secret key (live):** `sk_live_...`

### Guardar as Keys com Segurança

```bash
# No Firebase Functions
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.publishable_key="pk_test_..."

# Verificar
firebase functions:config:get
```

### Arquivo `.env` (para desenvolvimento local):

```env
# backend/cloud-functions/.env
STRIPE_SECRET_KEY=sk_test_51Xxx...
STRIPE_PUBLISHABLE_KEY=pk_test_51Xxx...
STRIPE_WEBHOOK_SECRET=whsec_... # (veremos adiante)
```

**IMPORTANTE:** Adicione `.env` ao `.gitignore`!

## Passo 4: Configurar Stripe Connect

Stripe Connect permite que profissionais recebam pagamentos diretamente.

### Escolher Tipo de Connect

Para o HelpNow, usaremos **Express** ou **Custom**:

| Tipo | Prós | Contras |
|------|------|---------|
| **Express** | Setup rápido, Stripe cuida da compliance | Menos controle da UX |
| **Custom** | Controle total da UX | Mais complexo, você cuida da compliance |

**Recomendação para MVP:** Use **Express**.

### Ativar Connect

1. No Dashboard, vá em **"Connect" → "Settings"**
2. Clique em **"Get started"**
3. Escolha **"Express"**
4. Configure:
   - **Plataforma:** HelpNow
   - **URL de retorno:** `https://helpnow.app/connect/return`
   - **URL de atualização:** `https://helpnow.app/connect/refresh`

### Criar Conta Connect para Profissional

```javascript
// backend/cloud-functions/src/stripe/createConnectAccount.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createConnectAccount(professionalId, email) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'PT', // Portugal
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      professionalId: professionalId
    }
  });

  return account.id; // Salvar no Firestore
}

// Gerar link de onboarding
async function createAccountLink(accountId) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'https://helpnow.app/connect/refresh',
    return_url: 'https://helpnow.app/connect/return',
    type: 'account_onboarding',
  });

  return accountLink.url; // Redirecionar profissional
}
```

## Passo 5: Configurar Payment Intents

Payment Intents é a API moderna do Stripe para processar pagamentos.

### Criar Payment Intent

```javascript
// backend/cloud-functions/src/stripe/createPayment.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount, currency, clientId, serviceRequestId, professionalStripeId) {
  const platformFeePercent = 0.15; // 15% de taxa da plataforma
  const platformFee = Math.round(amount * platformFeePercent);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount, // em centavos (ex: 5000 = €50)
    currency: currency, // 'eur'
    application_fee_amount: platformFee,
    transfer_data: {
      destination: professionalStripeId, // Conta Connect do profissional
    },
    metadata: {
      clientId: clientId,
      serviceRequestId: serviceRequestId
    }
  });

  return paymentIntent.client_secret; // Enviar para o frontend
}
```

### Confirmar Payment no Frontend (FlutterFlow)

```javascript
// No FlutterFlow, usar Stripe custom action
const stripe = Stripe(publishableKey);

const {error} = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Cliente Nome',
      email: 'cliente@email.com'
    }
  }
});

if (error) {
  // Erro no pagamento
  console.error(error.message);
} else {
  // Pagamento bem-sucedido!
}
```

## Passo 6: Configurar Apple Pay e Google Pay

### Apple Pay

1. No Dashboard, vá em **"Settings" → "Payment methods"**
2. Ative **"Apple Pay"**
3. Adicione seus domínios:
   - `helpnow.app`
   - `www.helpnow.app`
4. Baixe o arquivo de verificação: `apple-developer-merchantid-domain-association`
5. Coloque em: `https://helpnow.app/.well-known/apple-developer-merchantid-domain-association`

### Google Pay

1. No Dashboard, ative **"Google Pay"**
2. Configure no FlutterFlow:

```javascript
const paymentRequest = stripe.paymentRequest({
  country: 'PT',
  currency: 'eur',
  total: {
    label: 'Serviço HelpNow',
    amount: 5000, // €50
  },
  requestPayerName: true,
  requestPayerEmail: true,
});

const elements = stripe.elements();
const prButton = elements.create('paymentRequestButton', {
  paymentRequest: paymentRequest,
});

// Verificar se Apple Pay ou Google Pay está disponível
paymentRequest.canMakePayment().then(function(result) {
  if (result) {
    prButton.mount('#payment-request-button');
  }
});
```

## Passo 7: Configurar Webhooks

Webhooks permitem que o Stripe notifique seu backend sobre eventos (pagamento confirmado, falha, etc).

### Criar Webhook

1. Vá em **"Developers" → "Webhooks"**
2. Clique em **"Add endpoint"**
3. Preencha:
   - **URL do endpoint:** `https://europe-west1-helpnow.cloudfunctions.net/stripeWebhook`
   - **Eventos a escutar:**
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `account.updated` (para Connect)
     - `payout.paid`
4. Copie o **Webhook signing secret:** `whsec_...`

### Implementar Webhook Handler

```javascript
// backend/cloud-functions/src/stripe/webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      await handleRefund(refund);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

async function handlePaymentSuccess(paymentIntent) {
  const { serviceRequestId, clientId } = paymentIntent.metadata;

  // Atualizar Firestore
  await admin.firestore().collection('service_requests').doc(serviceRequestId).update({
    'payment.status': 'paid',
    'payment.paidAt': admin.firestore.FieldValue.serverTimestamp(),
    'payment.paymentIntentId': paymentIntent.id,
    status: 'paid'
  });

  // Registrar pagamento
  await admin.firestore().collection('payments').add({
    serviceRequestId: serviceRequestId,
    clientId: clientId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    stripePaymentIntentId: paymentIntent.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Enviar notificação para cliente e profissional
  // (implementar com FCM)
}
```

## Passo 8: Testar Pagamentos

### Teste Manual no Dashboard

1. Vá em **"Developers" → "Events"**
2. Clique em **"Send test webhook"**
3. Escolha evento: `payment_intent.succeeded`
4. Verifique se seu webhook recebeu

### Teste com Stripe CLI

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:5001/helpnow/europe-west1/stripeWebhook

# Trigger evento de teste
stripe trigger payment_intent.succeeded
```

## Passo 9: Calcular Taxas

### Taxas do Stripe (Portugal/EU):

- **Cartões europeus:** 1.4% + €0.25
- **Cartões não-europeus:** 2.9% + €0.25
- **Apple Pay / Google Pay:** 1.4% + €0.25
- **Stripe Connect (Express):** Sem taxa adicional

### Taxas da Plataforma HelpNow:

Sugestão: **15% do valor do serviço**

Exemplo:
- Serviço: €100
- Taxa Stripe: €1.65
- Taxa Plataforma (15%): €15
- **Profissional recebe: €83.35**

```javascript
// Cálculo no backend
function calculateFees(serviceAmount) {
  const stripeFeePercent = 0.014;
  const stripeFeeFixed = 0.25;
  const platformFeePercent = 0.15;

  const stripeFee = (serviceAmount * stripeFeePercent) + stripeFeeFixed;
  const platformFee = serviceAmount * platformFeePercent;
  const professionalReceives = serviceAmount - stripeFee - platformFee;

  return {
    serviceAmount,
    stripeFee: Math.round(stripeFee * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    professionalReceives: Math.round(professionalReceives * 100) / 100
  };
}
```

## Passo 10: Ativar Modo de Produção

Quando estiver pronto para lançar:

1. **Complete a verificação da conta:**
   - Envie documentos de identidade
   - Detalhes da empresa
   - Conta bancária

2. **Atualize as API keys:**
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_..."
   firebase functions:config:set stripe.publishable_key="pk_live_..."
   ```

3. **Recrie o webhook com URL de produção**

4. **Teste com pequenas transações reais**

## Segurança

### Boas Práticas:

- **NUNCA** exponha `secret_key` no frontend
- Use HTTPS em todos os endpoints
- Valide webhooks com `stripe-signature`
- Implemente rate limiting
- Log todas as transações
- Monitore transações suspeitas

### PCI Compliance:

Usando Stripe Elements/Payment Intents, você está automaticamente PCI compliant, pois os dados do cartão **nunca passam pelo seu servidor**.

## Monitoramento

### Alertas Importantes:

1. **Taxa de falha > 5%**
2. **Chargebacks > 0.5%**
3. **Fraudes detectadas**
4. **Webhook failures**

Configure em **"Settings" → "Notifications"**.

## Troubleshooting

### Erro: "No such payment_intent"

**Causa:** Payment Intent ID incorreto ou de ambiente errado (test vs live).

**Solução:** Verifique se está usando as keys corretas (test ou live).

### Erro: "Your card was declined"

**Causa:** Cartão de teste incorreto ou cartão real sem fundos.

**Solução:** Use cartões de teste válidos ou verifique saldo.

### Erro: "Webhook signature verification failed"

**Causa:** Webhook secret incorreto ou request body modificado.

**Solução:** Verifique se `STRIPE_WEBHOOK_SECRET` está correto e use `req.rawBody`.

## Próximos Passos

- [Configurar FlutterFlow](flutterflow-setup.md)
- [Configurar Google Maps API](maps-setup.md)
- [Implementar Cloud Functions](../api/cloud-functions.md)

## Recursos

- [Documentação Stripe](https://stripe.com/docs)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Testing](https://stripe.com/docs/testing)

---

**Última atualização:** 2025-12-11
