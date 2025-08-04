// src/pages/api/webhooks/stripe.ts
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "../../../config/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const config = {
  api: {
    bodyParser: false, // Desactiva el bodyParser para manejar raw body
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  // Leer el body como texto plano (raw)
  const rawBody = await getRawBody(req);
  const signature = req.headers["stripe-signature"] as string;

  try {
    // Verificar la firma del webhook
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Manejar eventos importantes
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSession(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(event.data.object);
        break;
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error en webhook:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

// Función para leer el body en formato raw
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Ejemplo: Manejar una suscripción completada
async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  if (!session.metadata?.user_id) return;

  await supabase
    .from("memberships")
    .upsert({
      user_id: session.metadata.user_id,
      subscription_id: session.subscription as string,
      plan: session.metadata.plan,
      status: "active",
    });
}

// Ejemplo: Manejar un pago de factura exitoso
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  await supabase
    .from("memberships")
    .update({ expires_at: new Date(invoice.period_end * 1000).toISOString() })
    .eq("subscription_id", subscriptionId);
}

// Ejemplo: Manejar una suscripción cancelada
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  await supabase
    .from("memberships")
    .update({ status: "canceled" })
    .eq("subscription_id", subscription.id);
}