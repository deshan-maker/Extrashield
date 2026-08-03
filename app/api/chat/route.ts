import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set in .env" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const userMessage: string | undefined = body?.message;
  const history: { role: "user" | "assistant"; content: string }[] =
    body?.history ?? [];

  if (!userMessage || typeof userMessage !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // --- Pull the customer's real data so the assistant answers from facts, not guesses ---
  let devices;
  try {
    devices = await prisma.device.findMany({
      where: { customerId: session.user.id },
      include: {
        warranty: true,
        claims: { orderBy: { submittedAt: "desc" }, take: 5 },
      },
    });
  } catch (err) {
    console.error("Chat: database query failed:", err);
    return NextResponse.json(
      { error: "Couldn't load your account data (database connection issue). Check the server terminal for details." },
      { status: 500 }
    );
  }

  const contextLines = devices.length
    ? devices.map((d) => {
        const w = d.warranty;
        const claimsSummary = d.claims.length
          ? d.claims.map((c) => `claim ${c.id.slice(-6)}: ${c.status} (${c.issue})`).join("; ")
          : "no claims filed";
        return `- ${d.brand} ${d.model} (IMEI ending ${d.imei.slice(-4)}): ${
          w
            ? `${w.tierLabel} plan, status ${w.status}, expires ${new Date(w.expiresAt).toDateString()}`
            : "no active warranty"
        }. ${claimsSummary}.`;
      })
    : ["This customer has no devices registered yet."];

  const systemPrompt = `You are the Extra Shield support assistant, embedded in a customer's warranty dashboard.
Extra Shield is a device warranty platform (phones/electronics) offering damage protection plans, claims, and repairs.
Answer only using the customer's real account data below. Do not invent device details, dates, or claim statuses.
If asked something unrelated to warranties/devices/claims/payments, politely redirect to that topic.
Keep answers short (2-4 sentences), friendly, and clear.

Customer: ${session.user.name}
Their devices and warranties:
${contextLines.join("\n")}`;

  try {
    const groq = new Groq({ apiKey });

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: userMessage },
      ],
    });

    const reply = result.choices[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Groq chat error:", err);
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again shortly." },
      { status: 502 }
    );
  }
}