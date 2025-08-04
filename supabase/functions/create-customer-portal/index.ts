import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.6.0?target=deno';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15'
});
serve(async (req)=>{
  // Handle CORS
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
    const { subscriptionId, returnUrl } = await req.json();
    const session = await stripe.billingPortal.sessions.create({
      customer: (await stripe.subscriptions.retrieve(subscriptionId)).customer,
      return_url: returnUrl
    });
    return new Response(JSON.stringify({
      portalUrl: session.url
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
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
