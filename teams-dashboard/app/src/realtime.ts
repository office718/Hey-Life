// Tells open browsers which collection changed, so they reload it (Server-Sent Events).
// One server process is enough for a church team. For several processes, switch to Postgres LISTEN/NOTIFY.
import { EventEmitter } from "node:events";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type { Env } from "./auth.ts";

export const bus = new EventEmitter();
bus.setMaxListeners(500);
export const changed = (collection: string) => bus.emit("change", collection);

export const realtime = new Hono<Env>();
realtime.get("/api/stream", c => streamSSE(c, async stream => {
  const on = (col: string) => { stream.writeSSE({ event: "change", data: col }).catch(() => {}); };
  bus.on("change", on);
  stream.onAbort(() => { bus.off("change", on); });
  while (!stream.aborted) { await stream.writeSSE({ event: "ping", data: "" }); await stream.sleep(25000); }
  bus.off("change", on);
}));
