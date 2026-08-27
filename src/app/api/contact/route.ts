import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const phone = normalizeText(payload.phone);
  const message = normalizeText(payload.message);

  if (!name || !email || !message) {
    return NextResponse.json({ message: "Name, email, and message are required." }, { status: 400 });
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  if (name.length > 120 || email.length > 254 || phone.length > 40 || message.length > 4000) {
    return NextResponse.json({ message: "One or more fields are too long." }, { status: 400 });
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      message,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unable to send message right now.";
    return NextResponse.json({ message: messageText }, { status: 500 });
  }
}