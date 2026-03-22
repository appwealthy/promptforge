import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CONVERSION_SYSTEM_PROMPT,
  CONVERSION_USER_PROMPT,
} from "@/lib/prompts";

export const maxDuration = 60;

// ── URL content extraction ─────────────────────────────────
async function extractContentFromUrl(url: string): Promise<string> {
  const normalizedUrl = url.trim();

  // Instagram oEmbed
  if (
    normalizedUrl.includes("instagram.com") ||
    normalizedUrl.includes("instagr.am")
  ) {
    try {
      const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(normalizedUrl)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        return `[Instagram post by @${data.author_name || "unknown"}]\nTitle: ${data.title || "No title"}\n\n${data.title || "Instagram content - please describe what the post is about."}`;
      }
    } catch {
      /* fall through */
    }
  }

  // YouTube oEmbed
  if (
    normalizedUrl.includes("youtube.com") ||
    normalizedUrl.includes("youtu.be")
  ) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        return `[YouTube video by ${data.author_name || "unknown"}]\nTitle: ${data.title || "No title"}\n\nThis video is titled "${data.title}". Please generate tools based on the topic implied by this title.`;
      }
    } catch {
      /* fall through */
    }
  }

  // TikTok oEmbed
  if (normalizedUrl.includes("tiktok.com")) {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(normalizedUrl)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        return `[TikTok by @${data.author_name || "unknown"}]\nTitle: ${data.title || "No title"}\n\n${data.title || "TikTok content about AI tools."}`;
      }
    } catch {
      /* fall through */
    }
  }

  // Twitter/X oEmbed
  if (
    normalizedUrl.includes("twitter.com") ||
    normalizedUrl.includes("x.com")
  ) {
    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        const textContent = (data.html || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return `[Post by ${data.author_name || "unknown"} on X/Twitter]\n\n${textContent}`;
      }
    } catch {
      /* fall through */
    }
  }

  // Generic fallback: fetch HTML and extract meta tags
  try {
    const res = await fetch(normalizedUrl, {
      headers: { "User-Agent": "PromptForge/1.0" },
      redirect: "follow",
    });
    if (res.ok) {
      const html = await res.text();
      const titleMatch = html.match(
        /<meta\s+property="og:title"\s+content="([^"]*)"/i
      );
      const descMatch = html.match(
        /<meta\s+property="og:description"\s+content="([^"]*)"/i
      );
      const pageTitleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title =
        titleMatch?.[1] || pageTitleMatch?.[1] || "Unknown page";
      const description = descMatch?.[1] || "";
      return `[Web page: ${title}]\n${description}\n\nContent from: ${normalizedUrl}. Generate tools based on the topic: ${title}. ${description}`;
    }
  } catch {
    /* fall through */
  }

  return `[Link: ${normalizedUrl}]\nCould not extract content from this URL. Please generate tools based on the URL topic.`;
}

// ── Model definitions ──────────────────────────────────────
type ModelId = "gemini-flash" | "claude-haiku" | "gpt-4o" | "gemini-pro";

interface ModelConfig {
  label: string;
  provider: "google" | "anthropic" | "openai";
  modelName: string;
  envKey: string;
}

const MODELS: Record<ModelId, ModelConfig> = {
  "gemini-flash": {
    label: "Gemini Flash",
    provider: "google",
    modelName: "gemini-2.0-flash",
    envKey: "GEMINI_API_KEY",
  },
  "claude-haiku": {
    label: "Claude Haiku",
    provider: "anthropic",
    modelName: "claude-haiku-4-5-20251001",
    envKey: "ANTHROPIC_API_KEY",
  },
  "gpt-4o": {
    label: "GPT-4o",
    provider: "openai",
    modelName: "gpt-4o",
    envKey: "OPENAI_API_KEY",
  },
  "gemini-pro": {
    label: "Gemini Pro",
    provider: "google",
    modelName: "gemini-1.5-pro",
    envKey: "GEMINI_API_KEY",
  },
};

// ── Provider call functions ────────────────────────────────
async function callAnthropic(
  modelName: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const msg = await anthropic.messages.create({
    model: modelName,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text : "";
}

async function callOpenAI(
  modelName: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4096,
  });
  return completion.choices[0].message.content || "";
}

async function callGoogle(
  modelName: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(
    systemPrompt + "\n\n" + userPrompt
  );
  return result.response.text();
}

// ── Main route ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { content, platform, model: requestedModel } = await req.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Please provide content to convert" },
        { status: 400 }
      );
    }

    // Determine which model to use
    let modelId: ModelId = "gemini-flash"; // default free tier
    if (
      requestedModel &&
      typeof requestedModel === "string" &&
      requestedModel in MODELS
    ) {
      modelId = requestedModel as ModelId;
    }

    const modelConfig = MODELS[modelId];

    // Check if API key exists for the requested model, fall back to gemini-flash
    let fallback = false;
    if (!process.env[modelConfig.envKey]) {
      if (modelId !== "gemini-flash") {
        modelId = "gemini-flash";
        fallback = true;
      } else {
        return NextResponse.json(
          { error: "AI service is not configured. Please contact support." },
          { status: 503 }
        );
      }
    }

    const activeModel = MODELS[modelId];

    // Extract content from URLs
    let processedContent = content.trim();
    const urlRegex = /^https?:\/\/\S+$/i;
    if (urlRegex.test(processedContent)) {
      processedContent = await extractContentFromUrl(processedContent);
    }

    const userPrompt = CONVERSION_USER_PROMPT(
      processedContent,
      platform || "universal"
    );

    // Call the appropriate provider
    let rawText: string;

    switch (activeModel.provider) {
      case "anthropic":
        rawText = await callAnthropic(
          activeModel.modelName,
          CONVERSION_SYSTEM_PROMPT,
          userPrompt
        );
        break;
      case "openai":
        rawText = await callOpenAI(
          activeModel.modelName,
          CONVERSION_SYSTEM_PROMPT,
          userPrompt
        );
        break;
      case "google":
        rawText = await callGoogle(
          activeModel.modelName,
          CONVERSION_SYSTEM_PROMPT,
          userPrompt
        );
        break;
      default:
        return NextResponse.json(
          { error: "Unknown provider" },
          { status: 500 }
        );
    }

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        {
          error:
            "AI returned an unexpected format. Please try again.",
          raw: rawText.substring(0, 500),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      result: parsed,
      model: activeModel.label,
      fallback: fallback
        ? "Requested model unavailable, used Gemini Flash instead"
        : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Conversion error:", message);
    return NextResponse.json(
      { error: "Failed to convert content. Please try again." },
      { status: 500 }
    );
  }
}
