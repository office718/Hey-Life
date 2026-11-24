// Claude features of the dashboard (drafts, meeting tasks, briefs) run through the church's own Anthropic API key.
import { Hono } from "hono";
import { cfg } from "./config.ts";
import type { Env } from "./auth.ts";

const used = new Map<number, number[]>();
function overLimit(userId: number) {
  const now = Date.now(), arr = (used.get(userId) || []).filter(t => now - t < 10 * 60e3);
  arr.push(now); used.set(userId, arr); return arr.length > cfg.aiPerUserPer10Min;
}

/** Pulls the first JSON object or array out of a model answer (tolerates ```json fences). */
export function parseJsonAnswer(text: string): unknown {
  const t = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(t); } catch {}
  const s = t.search(/[\[{]/); if (s < 0) throw new Error("no json");
  const open = t[s], close = open === "{" ? "}" : "]", e = t.lastIndexOf(close);
  return JSON.parse(t.slice(s, e + 1));
}

export const ai = new Hono<Env>();
ai.post("/api/ai", async c => {
  if (!cfg.anthropicKey) return c.json({ code: "sampling_disabled" }, 503);
  const user = c.get("user");
  if (overLimit(user.id)) return c.json({ code: "rate_limited" }, 429);
  const b = await c.req.json().catch(() => ({}));
  const prompt = String(b.prompt || ""), wantJson = !!b.json;
  if (!prompt || prompt.length > 300_000) return c.json({ code: "invalid_argument" }, 400);
  let r: Response;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": cfg.anthropicKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: cfg.anthropicModel, max_tokens: wantJson ? 8000 : 3000, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch { return c.json({ code: "unavailable" }, 502); }
  if (r.status === 429 || r.status === 529) return c.json({ code: "rate_limited" }, 429);
  if (!r.ok) { console.error("anthropic", r.status, (await r.text()).slice(0, 500)); return c.json({ code: "unavailable" }, 502); }
  const out: any = await r.json();
  const text = (out.content || []).filter((x: any) => x.type === "text").map((x: any) => x.text).join("");
  if (out.stop_reason === "refusal") return c.json({ code: "refused" }, 422);
  if (!text.trim()) return c.json({ code: "empty_completion" }, 502);
  const truncated = out.stop_reason === "max_tokens";
  if (!wantJson) return c.json({ text, truncated });
  try { return c.json({ json: parseJsonAnswer(text), truncated }); }
  catch { return c.json({ code: "invalid_json" }, 422); }
});
