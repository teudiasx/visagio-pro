import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  console.log('💳 [CHECKOUT] Iniciando criação de checkout session');
  
  try {
    console.log('📦 [CHECKOUT] Parseando body do request...');
    const { priceId, userId, userEmail } = await request.json();

    console.log('📝 [CHECKOUT] Dados recebidos:', {
      priceId,
      userId,
      userEmail,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY
    });

    if (!priceId || !userId || !userEmail) {
      console.error('❌ [CHECKOUT] Validação falhou - campos obrigatórios ausentes');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🔄 [CHECKOUT] Criando checkout session no Stripe...');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    console.log('✅ [CHECKOUT] Sessão criada com sucesso:', {
      sessionId: session.id,
      url: session.url,
      customerId: session.customer,
      subscriptionId: session.subscription
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('❌❌❌ [CHECKOUT] ERRO CRÍTICO ao criar checkout session ❌❌❌');
    console.error('Tipo:', error?.constructor?.name);
    console.error('Mensagem:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Stripe Type:', error?.type);
    console.error('Stripe Code:', error?.code);
    console.error('Status Code:', error?.statusCode);
    console.error('Raw:', error?.raw);
    console.error('Erro completo:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message,
        type: error.type || error?.constructor?.name
      },
      { status: 500 }
    );
  }
}
