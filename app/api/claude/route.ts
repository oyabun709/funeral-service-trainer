import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { system, messages, stream } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const model = anthropic("claude-sonnet-4-5");

    if (stream) {
      const result = streamText({
        model,
        maxOutputTokens: 1024,
        ...(system ? { system } : {}),
        messages,
      });
      return result.toTextStreamResponse();
    }

    const result = await generateText({
      model,
      maxOutputTokens: 1024,
      ...(system ? { system } : {}),
      messages,
    });

    return NextResponse.json({ text: result.text });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "API call failed" }, { status: 500 });
  }
}
