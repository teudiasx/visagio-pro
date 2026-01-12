import Stripe from 'stripe';

// Inicializar Stripe com a chave secreta
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// IDs de preço do Stripe para os planos
export const STRIPE_PRICE_IDS = {
  standard: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD || 'price_standard_1990', // R$ 19,90
  premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium_2990',   // R$ 29,90
};

// Configuração dos planos
export const PLANS = {
  standard: {
    name: 'Standard',
    oldPrice: 'R$ 49,90',
    price: 'R$ 19,90',
    priceInCents: 1990,
    stripePriceId: STRIPE_PRICE_IDS.standard,
    features: [
      'Análise facial completa por IA',
      'Semana 1: Cabelo',
      'Semana 2: Barba & Sobrancelha',
    ],
  },
  premium: {
    name: 'Premium',
    oldPrice: 'R$ 99,90',
    price: 'R$ 29,90',
    priceInCents: 2990,
    stripePriceId: STRIPE_PRICE_IDS.premium,
    features: [
      'Análise facial completa por IA',
      'Todas as 4 semanas desbloqueadas',
      'Skincare + Acessórios + Postura',
      'Suporte prioritário 24/7',
    ],
  },
};

/**
 * Criar sessão de checkout do Stripe
 * @param priceId - ID do preço no Stripe (price_standard_1990 ou price_premium_2990)
 * @param userId - ID do usuário
 * @param successUrl - URL de sucesso após pagamento
 * @param cancelUrl - URL de cancelamento
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    return session;
  } catch (error) {
    throw error;
  }
}

/**
 * Verificar status da assinatura do usuário
 * @param customerId - ID do cliente no Stripe
 */
export async function getSubscriptionStatus(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    return subscriptions.data[0] || null;
  } catch (error) {
    throw error;
  }
}
