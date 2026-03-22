import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CONVERSION_SYSTEM_PROMPT, CONVERSION_USER_PROMPT } from "@/lib/prompts";

export const maxDuration = 60;

// Extract content from a URL by fetching the page
async function extractContentFromUrl(url: string): Promise<{ content: string; source: string }> {
  // Try Instagram oEmbed API
  if (url.includes("instagram.com")) {
    try {
      const oembedRes = await fetch(
        `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const parts: string[] = [];
        if (data.title) parts.push(data.title);
        if (data.author_name) parts.push(`Posted by: ${data.author_name}`);
        if (parts.length > 0) {
          return { content: parts.join("\n\n"), source: "Instagram" };
        }
      }
    } catch {
      /* fall through to generic fetch */
    }
  }

  // Try YouTube oEmbed
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const parts: string[] = [];
        if (data.title) parts.push(data.title);
        if (data.author_name) parts.push(`By: ${data.author_name}`);
        if (parts.length > 0) {
          return { content: parts.join("\n\n"), source: "YouTube" };
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Try TikTok oEmbed
  if (url.includes("tiktok.com")) {
    try {
      const oembedRes = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const parts: string[] = [];
        if (data.title) parts.push(data.title);
        if (data.author_name) parts.push(`By: ${data.author_name}`);
        if (parts.length > 0) {
          return { content: parts.join("\n\n"), source: "TikTok" };
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Try X/Twitter oEmbed
  if (url.includes("twitter.com") || url.includes("x.com")) {
    try {
      const oembedRes = await fetch(
        `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const parts: string[] = [];
        if (data.html) {
          // Extract text content from the embed HTML
          const textContent = data.html
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (textContent) parts.push(textContent);
        }
        if (data.author_name) parts.push(`Posted by: ${data.author_name}`);
        if (parts.length > 0) {
          return { content: parts.join("\n\n"), source: "X/Twitter" };
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Generic HTML fetch for any URL
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PromptForge/1.0; +https://promptforge-one.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return { content: "", source: "unknown" };

    const html = await res.text();

    // Helper to extract meta tag content
    const extract = (pattern: RegExp): string => {
      const match = pattern.exec(html);
      return (
        match?.[1]
          ?.replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">") || ""
      );
    };

    const ogTitle =
      extract(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/) ||
      extract(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/);
    const ogDesc =
      extract(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/) ||
      extract(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/);
    const metaDesc =
      extract(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/) ||
      extract(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/);
    const title = extract(/<title>([^<]*)<\/title>/);

    const parts: string[] = [];
    if (ogTitle || title) parts.push(ogTitle || title);
    if (ogDesc) parts.push(ogDesc);
    if (metaDesc && metaDesc !== ogDesc) parts.push(metaDesc);

    let hostname = "unknown";
    try {
      hostname = new URL(url).hostname;
    } catch {
      /* ignore */
    }

    return { content: parts.join("\n\n"), source: hostname };
  } catch {
    return { content: "", source: "unknown" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, platform } = await req.json();

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide more content to convert (at least 10 characters)." },
        { status: 400 }
      );
    }

    let processedContent = content.trim();
    let sourceNote = "";

    // Detect if input contains a URL - try to extract content from it
    const urlRegex = /https?:\/\/\S+/;
    const urlMatch = processedContent.match(urlRegex);

    if (urlMatch) {
      const url = urlMatch[0];
      const isUrlOnly = /^\s*https?:\/\/\S+\s*$/.test(processedContent);

      const extracted = await extractContentFromUrl(url);

      if (isUrlOnly) {
        // Input is ONLY a URL
        if (!extracted.content) {
          return NextResponse.json(
            {
              error: `I couldn't extract any text from that ${extracted.source} link. This can happen with private posts or pages that block automated access.\n\nTip: Open the post, copy the caption or transcript text, and paste it here instead.`,
            },
            { status: 400 }
          );
        }
        processedContent = extracted.content;
        sourceNote = `[Content extracted from ${extracted.source}: ${url}]\n\n`;
      } else {
        // Input has a URL mixed with other text - use as-is, but append extracted content if available
        if (extracted.content) {
          processedContent += `\n\n[Additional context extracted from link: ${extracted.content}]`;
        }
      }
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
          content: CONVERSION_USER_PROMPT(
            sourceNote + processedContent.slice(0, 5000),
            platform || "universal"
          ),
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
