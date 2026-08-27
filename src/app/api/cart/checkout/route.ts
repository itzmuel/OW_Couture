import { NextResponse } from "next/server";

import { getCatalogProducts } from "@/lib/catalog/products";
import { getStripeServerClient } from "@/lib/stripe/server";
import { defaultShippingPlanContent } from "@/lib/admin/website";
import { estimateShippingCostCents, type ShippingLocation } from "@/lib/shipping";

type CartCheckoutItem = {
  code?: string;
  name?: string;
  size?: string;
  quantity?: number;
  weightKg?: number;
};

type CartCheckoutRequest = {
  items?: CartCheckoutItem[];
  deliveryLocation?: ShippingLocation;
  shippingCostCents?: number;
  totalWeightKg?: number;
};

function getBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configuredUrl?.startsWith("http://") || configuredUrl?.startsWith("https://")) {
    return configuredUrl;
  }

  const requestOrigin = request.headers.get("origin")?.trim();
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.trim() || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const normalizedHost = vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${normalizedHost}`;
  }

  return "http://localhost:3000";
}

function parsePriceToCents(priceFrom: string) {
  const normalized = Number(priceFrom.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }

  return Math.round(normalized * 100);
}

export async function POST(request: Request) {
  let payload: CartCheckoutRequest;

  try {
    payload = (await request.json()) as CartCheckoutRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const rawItems = payload.items ?? [];
  if (rawItems.length === 0) {
    return NextResponse.json({ message: "Add at least one item to your bag before checkout." }, { status: 400 });
  }

  const items = rawItems
    .map((item) => ({
      code: item.code?.trim() ?? "",
      name: item.name?.trim() ?? "OW Couture Piece",
      size: item.size?.trim() ?? "Unspecified",
      quantity: Math.max(1, Math.min(10, Math.floor(item.quantity ?? 1))),
    }))
    .filter((item) => item.code.length > 0);

  if (items.length === 0) {
    return NextResponse.json({ message: "Checkout items are missing product codes." }, { status: 400 });
  }

  const deliveryLocation = payload.deliveryLocation;
  if (
    !deliveryLocation ||
    !deliveryLocation.country?.trim() ||
    !deliveryLocation.province?.trim() ||
    !deliveryLocation.address?.trim() ||
    !deliveryLocation.postalCode?.trim()
  ) {
    return NextResponse.json({ message: "Enter a complete delivery location to calculate shipping." }, { status: 400 });
  }

  try {
    const stripe = getStripeServerClient();
    const products = await getCatalogProducts();
    const productsByCode = new Map(products.map((product) => [product.code, product]));

    const invalidCodes: string[] = [];
    const lineItems: {
      quantity: number;
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: {
          name: string;
          description: string;
          metadata: {
            productCode: string;
            selectedSize: string;
          };
        };
      };
    }[] = [];

    items.forEach((item) => {
      const product = productsByCode.get(item.code);
      if (!product) {
        invalidCodes.push(item.code);
        return;
      }

      const unitAmount = parsePriceToCents(product.priceFrom);
      if (unitAmount === null) {
        invalidCodes.push(item.code);
        return;
      }

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: "cad",
          unit_amount: unitAmount,
          product_data: {
            name: product.name,
            description: `Code ${product.code} | Size ${item.size}`,
            metadata: {
              productCode: product.code,
              selectedSize: item.size,
            },
          },
        },
      });
    });

    const calculatedWeightKg = items.reduce((total, item) => {
      const itemWeight = typeof item.weightKg === "number" && Number.isFinite(item.weightKg) && item.weightKg > 0 ? item.weightKg : 1;
      return total + itemWeight * Math.max(1, Math.floor(item.quantity ?? 1));
    }, 0);
    const calculatedShippingCostCents = estimateShippingCostCents(calculatedWeightKg, deliveryLocation, defaultShippingPlanContent);

    if (calculatedShippingCostCents === null) {
      return NextResponse.json({ message: "No shipping rate is available for the selected delivery location." }, { status: 400 });
    }

    if (invalidCodes.length > 0 || lineItems.length === 0) {
      return NextResponse.json(
        {
          message: "Some bag items are unavailable for checkout. Please remove them and try again.",
          invalidCodes,
        },
        { status: 400 },
      );
    }

    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "cad",
        unit_amount: calculatedShippingCostCents,
        product_data: {
          name: "Shipping",
          description: `Delivery to ${deliveryLocation.region?.trim() || deliveryLocation.province.trim()}, ${deliveryLocation.country.trim()} | ${calculatedWeightKg.toFixed(1)} kg`,
          metadata: {
            productCode: "SHIPPING",
            selectedSize: deliveryLocation.postalCode.trim(),
          },
        },
      },
    });

    const baseUrl = getBaseUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["CA", "US"],
      },
      line_items: lineItems,
      metadata: {
        source: "ow-couture-cart",
        deliveryCountry: deliveryLocation.country.trim(),
        deliveryProvince: deliveryLocation.province.trim(),
        deliveryRegion: deliveryLocation.region?.trim() ?? "",
        deliveryPostalCode: deliveryLocation.postalCode.trim(),
        deliveryAddress: deliveryLocation.address.trim(),
        shippingWeightKg: calculatedWeightKg.toFixed(1),
        shippingCostCents: String(calculatedShippingCostCents),
      },
      success_url: `${baseUrl}/catalog?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/catalog?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ message: "Unable to create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize checkout.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
