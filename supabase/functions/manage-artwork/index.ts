import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function ownedArtwork(slug: string, token: string) {
  if (!slug || !token || token.length < 32) return null;
  const { data, error } = await supabase
    .from("artworks")
    .select("id,slug,title,description,author_name,image_path,image_width,image_height,image_bytes,status,created_at,published_at,owner_token_hash")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data?.owner_token_hash) return null;
  return (await sha256Hex(token)) === data.owner_token_hash ? data : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: cors });

  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "list") {
      const items = Array.isArray(body?.items) ? body.items.slice(0, 100) : [];
      const out = [];
      for (const item of items) {
        const row = await ownedArtwork(String(item?.slug || ""), String(item?.token || ""));
        if (row) {
          const { owner_token_hash, ...safe } = row;
          out.push(safe);
        }
      }
      return new Response(JSON.stringify({ artworks: out }), { headers: cors });
    }

    const slug = String(body?.slug || "");
    const token = String(body?.token || "");
    const row = await ownedArtwork(slug, token);
    if (!row) return new Response(JSON.stringify({ error: "not owner" }), { status: 403, headers: cors });

    if (action === "visibility") {
      const nextStatus = Boolean(body?.public) ? "published" : "hidden";
      const patch: Record<string, unknown> = { status: nextStatus };
      if (nextStatus === "published" && !row.published_at) patch.published_at = new Date().toISOString();
      const { data, error } = await supabase.from("artworks").update(patch).eq("id", row.id)
        .select("id,slug,title,description,author_name,image_path,image_width,image_height,image_bytes,status,created_at,published_at").single();
      if (error) throw error;
      return new Response(JSON.stringify({ artwork: data }), { headers: cors });
    }

    if (action === "delete") {
      if (row.image_path) {
        const { error: storageError } = await supabase.storage.from("artworks").remove([row.image_path]);
        if (storageError) throw storageError;
      }
      const { error } = await supabase.from("artworks").delete().eq("id", row.id);
      if (error) throw error;
      return new Response(JSON.stringify({ deleted: true, slug: row.slug }), { headers: cors });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: cors });
  }
});
