import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CONVERSION_SYSTEM_PROMPT, CONVERSION_USER_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { content, platform } = await req.json();

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide more content to convert (at least 10 characters)." },
        { status: 400 }
      );
    }

    // Detect if input is just a URL with no actual content
    const trimmed = content.trim();
    const urlOnlyRegex = /^https?:\/\/\S+$/;
    if (urlOnlyRegex.test(trimmed)) {
      return NextResponse.json(
        {
          error:
            "It looks like you pasted a link instead of the actual content. PromptForge can't visit URLs — please copy and paste the text from the post (the caption, transcript, or tip) directly into the box.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Set ANTHROPIC_API_KEY in your environment." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: CONVERSION_USER_PROMPT(content.slice(0, 5000), platform || "universal"),
        },
      ],
      system: CONVERSION_SYSTEM_PROMPT,
    });

    // Extract the text content
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse JSON from the response (handle markdown code fences)
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error("Conversion error:", error);
    const message = error instanceof Error ? error.message : "Conversion failed";

    if (message.includes("JSON")) {
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
