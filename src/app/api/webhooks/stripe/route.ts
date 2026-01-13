import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  console.log('🎣 [WEBHOOK] Webhook Stripe recebido');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    console.log('📝 [WEBHOOK] Verificando assinatura:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
    });

    if (!signature) {
      console.error('❌ [WEBHOOK] Assinatura ausente');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      console.log('🔐 [WEBHOOK] Construindo evento com assinatura...');
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log('✅ [WEBHOOK] Evento verificado:', event.type);
    } catch (err: any) {
      console.error('❌ [WEBHOOK] Assinatura inválida:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🔄 [WEBHOOK] Processando evento:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('💰 [WEBHOOK] Checkout completado');
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        console.log('📝 [WEBHOOK] Dados da sessão:', {
          sessionId: session.id,
          userId,
          customer: session.customer,
          subscription: session.subscription,
          metadata: session.metadata
        });

        if (!userId) {
          console.error('❌ [WEBHOOK] userId não encontrado nos metadados');
          break;
        }

        try {
          console.log('🔍 [WEBHOOK] Buscando dados da assinatura...');
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          console.log('✅ [WEBHOOK] Assinatura recuperada:', {
            subscriptionId: subscription.id,
            status: subscription.status,
            priceId: subscription.items.data[0].price.id
          });

          const priceId = subscription.items.data[0].price.id;
          let subscriptionStatus: 'standard' | 'premium' = 'standard';

          if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
            subscriptionStatus = 'premium';
            console.log('🌟 [WEBHOOK] Plano identificado: PREMIUM');
          } else if (priceId === process.env.STRIPE_PRICE_STANDARD) {
            subscriptionStatus = 'standard';
            console.log('⭐ [WEBHOOK] Plano identificado: STANDARD');
          }

          console.log('💾 [WEBHOOK] Atualizando perfil no Supabase...');
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: subscriptionStatus,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_started_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) {
            console.error('❌ [WEBHOOK] Erro ao atualizar Supabase:', error);
            throw error;
          }

          console.log('✅ [WEBHOOK] Perfil atualizado com sucesso');
        } catch (innerError: any) {
          console.error('❌ [WEBHOOK] Erro no processamento do checkout:', innerError);
          throw innerError;
        }

        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        console.log('💵 [WEBHOOK] Fatura paga/pagamento bem-sucedido');
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;

        console.log('📝 [WEBHOOK] Dados da fatura:', {
          invoiceId: invoice.id,
          subscriptionId,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid
        });

        if (!subscriptionId) {
          console.error('❌ [WEBHOOK] subscriptionId não encontrado na fatura');
          break;
        }

        try {
          console.log('🔍 [WEBHOOK] Buscando assinatura no Stripe...');
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          const priceId = subscription.items.data[0].price.id;

          console.log('✅ [WEBHOOK] Assinatura encontrada:', {
            customerId,
            priceId,
            status: subscription.status
          });

          console.log('🔍 [WEBHOOK] Buscando perfil no Supabase por customerId...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profileError) {
            console.error('❌ [WEBHOOK] Erro ao buscar perfil:', profileError);
          }

          if (!profile) {
            console.error('❌ [WEBHOOK] Perfil não encontrado para customerId:', customerId);
            break;
          }

          console.log('✅ [WEBHOOK] Perfil encontrado:', profile.id);

          let subscriptionStatus: 'standard' | 'premium' = 'standard';

          if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
            subscriptionStatus = 'premium';
            console.log('🌟 [WEBHOOK] Plano: PREMIUM');
          } else if (priceId === process.env.STRIPE_PRICE_STANDARD) {
            subscriptionStatus = 'standard';
            console.log('⭐ [WEBHOOK] Plano: STANDARD');
          }

          console.log('💾 [WEBHOOK] Atualizando perfil...');
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: subscriptionStatus,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          if (error) {
            console.error('❌ [WEBHOOK] Erro ao atualizar perfil:', error);
            throw error;
          }

          console.log('✅ [WEBHOOK] Perfil atualizado com sucesso');
        } catch (innerError: any) {
          console.error('❌ [WEBHOOK] Erro no processamento da fatura:', innerError);
          throw innerError;
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        console.log('🔄 [WEBHOOK] Assinatura atualizada/deletada');
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log('📝 [WEBHOOK] Dados da assinatura:', {
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status,
          eventType: event.type
        });

        try {
          console.log('🔍 [WEBHOOK] Buscando perfil no Supabase...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profileError) {
            console.error('❌ [WEBHOOK] Erro ao buscar perfil:', profileError);
          }

          if (!profile) {
            console.error('❌ [WEBHOOK] Perfil não encontrado para customerId:', customerId);
            break;
          }

          console.log('✅ [WEBHOOK] Perfil encontrado:', profile.id);

          let newStatus: 'free' | 'standard' | 'premium' = 'free';

          if (subscription.status === 'active') {
            const priceId = subscription.items.data[0].price.id;
            if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
              newStatus = 'premium';
              console.log('🌟 [WEBHOOK] Novo status: PREMIUM');
            } else if (priceId === process.env.STRIPE_PRICE_STANDARD) {
              newStatus = 'standard';
              console.log('⭐ [WEBHOOK] Novo status: STANDARD');
            }
          } else {
            console.log('❌ [WEBHOOK] Assinatura não ativa, novo status: FREE');
          }

          console.log('💾 [WEBHOOK] Atualizando perfil com novo status...');
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          if (error) {
            console.error('❌ [WEBHOOK] Erro ao atualizar perfil:', error);
            throw error;
          }

          console.log('✅ [WEBHOOK] Perfil atualizado com sucesso');
        } catch (innerError: any) {
          console.error('❌ [WEBHOOK] Erro no processamento da atualização:', innerError);
          throw innerError;
        }

        break;
      }

      default:
        console.log('⚠️ [WEBHOOK] Evento não tratado:', event.type);
        break;
    }

    console.log('✅ [WEBHOOK] Webhook processado com sucesso');
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌❌❌ [WEBHOOK] ERRO CRÍTICO no processamento do webhook ❌❌❌');
    console.error('Tipo:', error?.constructor?.name);
    console.error('Mensagem:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Erro completo:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error?.message
      },
      { status: 500 }
    );
  }
}
