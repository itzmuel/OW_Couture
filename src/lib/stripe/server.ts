import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  // Guard against accidentally deploying checkout with a test key in production.
  if (process.env.VERCEL_ENV === "production" && !secretKey.startsWith("sk_live_")) {
    throw new Error("Production deployment requires a live Stripe secret key (sk_live_...).");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-07-29.dahlia",
    });
  }

  return stripeClient;
}
