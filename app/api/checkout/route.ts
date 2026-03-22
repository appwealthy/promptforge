import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
});

const PLANS: Record<string, { name: string; price: number; interval: "month" | "year" }> = {
  pro: {
    name: "PromptForge Pro",
    price: 2000,
    interval: "month",
  },
  power: {
    name: "PromptForge Power",
    price: 3500,
    interval: "month",
  },
  pro_yearly: {
    name: "PromptForge Pro (Yearly)",
    price: 19200,
    interval: "year",
  },
  power_yearly: {
    name: "PromptForge Power (Yearly)",
    price: 33600,
    interval: "year",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured yet. Coming soon!" },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planConfig.name,
              description: `${planConfig.name} subscription`,
            },
            recurring: { interval: planConfig.interval },
            unit_amount: planConfig.price,
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.nextUrl.origin}/dashboard?upgraded=true`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
