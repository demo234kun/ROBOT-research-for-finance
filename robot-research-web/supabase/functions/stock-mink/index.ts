// 沪深分钟K线（含均线）Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let code: string, period: string, pageSize: string;
  try {
    const body = await req.json();
    code = body.code;
    if (!code) throw new Error("Missing code");
    period = body.period ?? "1";
    pageSize = body.pageSize ?? "240";
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const upstream = await fetch(
    "https://app-csctj2dvhmo1-api-NLZ1o2xd6DE9-gateway.appmiaoda.com/stock/hs/mink",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: new URLSearchParams({ code, period, pageSize }).toString(),
    }
  );

  if (upstream.status === 429 || upstream.status === 402) {
    return new Response(await upstream.text(), {
      status: upstream.status, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: `Upstream error: ${upstream.status}` }), {
      status: 502, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: 200, headers: { ...CORS, "Content-Type": "application/json" },
  });
});
