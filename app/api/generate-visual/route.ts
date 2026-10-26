import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { GraphicCategory } from "@/lib/types";

export const runtime = "nodejs";

/**
 * EXPERIMENTAL — generates a post's visual through Artlist via Claude's MCP
 * connector (beta `mcp-client-2025-11-20`): Claude calls whatever generation
 * tools Artlist's MCP server exposes, using the brief below, instead of this
 * app's own canvas template (lib/graphic.ts).
 *
 * Needs ARTLIST_MCP_URL (the server URL from https://artlist.io/mcp) and
 * ARTLIST_MCP_TOKEN (an OAuth access token for that server — see "Obtaining
 * an access token for testing" in Anthropic's MCP connector docs) alongside
 * ANTHROPIC_API_KEY. None of this has been exercised against a real Artlist
 * response yet (no working token at the time this was written): Artlist's
 * exact tool names are unknown, Claude discovers them itself via the
 * toolset, and MCP tool results can only carry text (SDK type
 * `BetaMCPToolResultBlock.content: string | BetaTextBlock[]`) — so the
 * result is parsed by pulling the first URL out of that text. Treat `raw` in
 * the response as the ground truth to re-check this parsing against once a
 * token is available.
 */

interface RequestBody {
  /** The post's headline/title, shown on the visual. */
  title: string;
  /** Daïmo's three graphic templates/color themes (see JSON_CONTRACT in lib/promptDefaults.ts). */
  category: GraphicCategory;
  /** Short supporting line (benefit or call to action). */
  highlight: string;
  /** What Artlist should produce. */
  kind: "image" | "video";
}

const CHARTER_COLORS =
  "dark blue (#394e9d), light blue (#3fb5cc), green (#65b22e), purple (#662d91), gray (#76818e), pink (#ec008c)";
const CHARTER_FONTS = "Exo 2 for titles, Exo for body text";

const CATEGORY_PALETTE: Record<GraphicCategory, string> = {
  tip: "dark blue and light blue",
  client: "dark blue and green",
  hiring: "purple and pink",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const mcpUrl = process.env.ARTLIST_MCP_URL;
  const mcpToken = process.env.ARTLIST_MCP_TOKEN;

  if (!apiKey) {
    return NextResponse.json({ error: "AI generation is not configured (missing ANTHROPIC_API_KEY)." }, { status: 501 });
  }
  if (!mcpUrl || !mcpToken) {
    return NextResponse.json(
      {
        error:
          "La génération via Artlist n'est pas configurée côté serveur (ARTLIST_MCP_URL et/ou ARTLIST_MCP_TOKEN manquants sur Vercel). Cette fonctionnalité est expérimentale tant qu'Artlist n'a pas confirmé un chemin d'authentification serveur à serveur pour son connecteur MCP.",
      },
      { status: 501 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { title, category, highlight, kind } = body;
  if (!title || !category || !kind || (kind !== "image" && kind !== "video")) {
    return NextResponse.json({ error: "Missing or invalid fields (title, category, kind)." }, { status: 400 });
  }
  if (!(category in CATEGORY_PALETTE)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const brief = [
    `Generate a ${kind === "video" ? "short video" : "still image"} for a Daïmo LinkedIn post.`,
    `Headline shown on it: "${title}".`,
    highlight ? `Supporting line: "${highlight}".` : "",
    `Daïmo's graphic charter: colors ${CHARTER_COLORS}; typography ${CHARTER_FONTS}. For this post's category ("${category}"), lean on ${CATEGORY_PALETTE[category]}.`,
    "Style: modern, structured, confident. No stock-photo cliché, no text burned into the image other than the headline/supporting line above, no logos other than Daïmo's own identity.",
    "Call whichever of your available tools actually generates this, then report back only the resulting asset URL.",
  ]
    .filter(Boolean)
    .join(" ");

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4096,
      betas: ["mcp-client-2025-11-20"],
      mcp_servers: [{ type: "url", url: mcpUrl, name: "artlist", authorization_token: mcpToken }],
      tools: [{ type: "mcp_toolset", mcp_server_name: "artlist" }],
      system:
        "You generate on-brand visuals for Daïmo's LinkedIn posts by calling the Artlist tools available to you. Use the brief you're given as the generation prompt as-is. Don't ask clarifying questions and don't explain your reasoning in text, just call the right tool.",
      messages: [{ role: "user", content: brief }],
    });

    const mcpResults = response.content.filter(
      (block): block is Anthropic.Beta.BetaMCPToolResultBlock => block.type === "mcp_tool_result"
    );

    const urls: string[] = [];
    for (const result of mcpResults) {
      if (result.is_error) continue;
      const text =
        typeof result.content === "string"
          ? result.content
          : result.content.map((block) => block.text).join("\n");
      const matches = text.match(/https?:\/\/\S+/g);
      if (matches) urls.push(...matches);
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "Artlist n'a renvoyé aucune URL exploitable.", raw: response.content },
        { status: 502 }
      );
    }

    return NextResponse.json({ urls, raw: response.content });
  } catch (err) {
    console.error("Artlist visual generation failed:", err);
    return NextResponse.json({ error: "La génération via Artlist a échoué." }, { status: 502 });
  }
}
