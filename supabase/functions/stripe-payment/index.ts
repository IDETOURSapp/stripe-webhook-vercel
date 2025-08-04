import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15'
});
export default (async (req)=>{
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
  try {
    const { userId, planId } = await req.json();
    const { data: user } = await supabase.from('users').select('email, stripe_customer_id').eq('id', userId).single();
    if (!user) {
      return new Response(JSON.stringify({
        error: 'User not found'
      }), {
        status: 404
      });
    }
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email
      });
      customerId = customer.id;
      await supabase.from('users').update({
        stripe_customer_id: customerId
      }).eq('id', userId);
    }
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: planId
        }
      ]
    });
    await supabase.from('users').update({
      stripe_subscription_id: subscription.id
    }).eq('id', userId);
    await supabase.from('memberships').insert({
      provider_id: userId,
      plan_name: planId,
      is_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    return new Response(JSON.stringify({
      subscription
    }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500
    });
  }
});
