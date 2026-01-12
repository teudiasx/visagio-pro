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
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('[Webhook] Event received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('[Webhook] No userId in metadata');
          break;
        }

        // Buscar a assinatura para determinar o plano
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const priceId = subscription.items.data[0].price.id;
        let subscriptionStatus: 'standard' | 'premium' = 'standard';

        // Determinar o plano baseado no priceId
        if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
          subscriptionStatus = 'premium';
        } else if (priceId === process.env.STRIPE_PRICE_STANDARD) {
          subscriptionStatus = 'standard';
        }

        console.log('[Webhook] Updating subscription for user:', userId, 'to:', subscriptionStatus);

        // Atualizar o perfil do usuário no Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscriptionStatus,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('[Webhook] Error updating profile:', error);
        } else {
          console.log('[Webhook] ✅ Profile updated successfully');
        }
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;

        if (!subscriptionId) {
          console.log('[Webhook] Invoice without subscription, skipping');
          break;
        }

        // Buscar a assinatura
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        // Buscar usuário pelo stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error('[Webhook] No profile found for customer:', customerId);
          break;
        }

        let subscriptionStatus: 'standard' | 'premium' = 'standard';

        if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
          subscriptionStatus = 'premium';
        } else if (priceId === process.env.STRIPE_PRICE_STANDARD) {
          subscriptionStatus = 'standard';
        }

        console.log('[Webhook] Invoice paid - Updating user:', profile.id, 'to:', subscriptionStatus);

        // Atualizar o perfil
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
          console.error('[Webhook] Error updating profile:', error);
        } else {
          console.log('[Webhook] ✅ Profile updated from invoice payment');
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Buscar usuário pelo stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error('[Webhook] No profile found for customer:', customerId);
          break;
        }

        let newStatus: 'free' | 'standard' | 'premium' = 'free';

        if (subscription.status === 'active') {
          const priceId = subscription.items.data[0].price.id;
          if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
            newStatus = 'premium';
          } else if (priceId === process.env.STRIPE_PRICE_STANDARD) {
            newStatus = 'standard';
          }
        }

        console.log('[Webhook] Updating subscription status for user:', profile.id, 'to:', newStatus);

        await supabase
          .from('profiles')
          .update({
            subscription_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        console.log('[Webhook] ✅ Subscription status updated');
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
