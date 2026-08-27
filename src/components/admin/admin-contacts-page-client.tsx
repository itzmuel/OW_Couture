"use client";

import { useEffect, useMemo, useState } from "react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminContactsPageClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/contacts", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as { message?: string; messages?: ContactMessage[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load contact messages.");
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const nextMessages = payload.messages ?? [];
    setMessages(nextMessages);
    setErrorMessage("");

    if (nextMessages.length > 0 && !nextMessages.some((item) => item.id === selectedId)) {
      setSelectedId(nextMessages[0].id);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadMessages();
  }, []);

  const selectedMessage = useMemo(() => {
    return messages.find((message) => message.id === selectedId) ?? null;
  }, [messages, selectedId]);

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Contacts</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Contact inbox</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Review messages sent from the contact page and follow up with clients directly.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="min-w-0 rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-2 py-3">Name</th>
                  <th className="px-2 py-3">Email</th>
                  <th className="px-2 py-3">Phone</th>
                  <th className="px-2 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-sm text-[var(--muted)]">Loading contact messages...</td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-sm text-[var(--muted)]">No contact messages yet.</td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr
                      key={message.id}
                      className={`cursor-pointer border-b border-[var(--line)] transition hover:bg-[var(--soft)] ${
                        selectedId === message.id ? "bg-[var(--soft)]" : ""
                      }`}
                      onClick={() => setSelectedId(message.id)}
                    >
                      <td className="px-2 py-3">
                        <p className="font-medium text-neutral-900">{message.name}</p>
                      </td>
                      <td className="px-2 py-3 text-neutral-700">{message.email}</td>
                      <td className="px-2 py-3 text-neutral-700">{message.phone || "Not provided"}</td>
                      <td className="px-2 py-3 text-neutral-700">{formatDateTime(message.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          {selectedMessage ? (
            <div className="grid gap-4">
              <div>
                <h3 className="text-2xl tracking-[-0.03em] text-neutral-950">{selectedMessage.name}</h3>
                <p className="mt-1 break-all text-sm text-neutral-700">{selectedMessage.email}</p>
                <p className="mt-1 text-sm text-neutral-700">{selectedMessage.phone || "Phone not provided"}</p>
              </div>

              <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Received</p>
                <p className="mt-2 text-xl tracking-[-0.02em] text-neutral-950">{formatDateTime(selectedMessage.created_at)}</p>
              </div>

              <div className="rounded-2xl border border-[var(--line)] p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-800">{selectedMessage.message}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select a contact message to view details.</p>
          )}
        </section>
      </div>
    </div>
  );
}