import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.6.0?target=deno';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15'
});
serve(async (req)=>{
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type'
      }
    });
  }
  try {
    const { userId, plan, customerEmail, metadata } = await req.json();
    // Validar FRONTEND_URL
    const frontendUrl = Deno.env.get('FRONTEND_URL');
    if (!frontendUrl || !frontendUrl.startsWith('http')) {
      throw new Error('FRONTEND_URL no está configurado correctamente');
    }
    // Crear o buscar cliente
    const existingCustomers = await stripe.customers.list({
      email: customerEmail
    });
    const customer = existingCustomers.data[0] || await stripe.customers.create({
      email: customerEmail,
      metadata: {
        userId
      }
    });
    // Validar priceId
    const priceId = Deno.env.get(`STRIPE_${plan.toUpperCase()}_PRICE_ID`);
    if (!priceId) {
      throw new Error(`Price ID no encontrado para el plan: ${plan}`);
    }
    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: [
        'card'
      ],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/dashboard?success=true`,
      cancel_url: `${frontendUrl}/dashboard?canceled=true`,
      metadata: metadata
    });
    return new Response(JSON.stringify({
      sessionId: session.id
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error en create-subscription:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
