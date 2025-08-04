import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15'
});
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
serve(async (req)=>{
  // 1. Obtener firma y payload
  const signature = req.headers.get('stripe-signature');
  const payload = await req.text();
  // 2. Configurar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'stripe-signature'
      }
    });
  }
  try {
    // 3. Verificar evento
    const event = stripe.webhooks.constructEvent(payload, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'));
    // 4. Procesar eventos
    switch(event.type){
      case 'checkout.session.completed':
        await handleCheckoutSession(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('❌ Webhook Error:', err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
// ================== MANEJADORES DE EVENTOS ==================
async function handleCheckoutSession(session) {
  console.log('💰 Checkout Session Completed:', session.id);
  // Solo procesar si el pago fue exitoso
  if (session.payment_status !== 'paid') return;
  await supabase.from('memberships').upsert({
    user_id: session.metadata.user_id,
    plan: session.metadata.plan,
    status: 'active',
    subscription_id: session.subscription,
    current_period_end: new Date(session.subscription_details.current_period_end * 1000).toISOString()
  });
}
async function handleInvoicePaid(invoice) {
  console.log('💳 Invoice Paid:', invoice.id);
  await supabase.from('memberships').update({
    current_period_end: new Date(invoice.period_end * 1000).toISOString(),
    status: 'active'
  }).eq('subscription_id', invoice.subscription);
}
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription Updated:', subscription.id);
  await supabase.from('memberships').update({
    status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
  }).eq('subscription_id', subscription.id);
}
async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription Deleted:', subscription.id);
  await supabase.from('memberships').update({
    status: 'canceled',
    canceled_at: new Date().toISOString()
  }).eq('subscription_id', subscription.id);
}
