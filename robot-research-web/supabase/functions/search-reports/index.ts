import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY")!;
  const queries = [
    "中信证券研究 人形机器人 量产 研报 2024 东方财富研报",
    "华泰证券 谐波减速器 国产替代 机器人 研报 东方财富 2024",
    "国泰君安 具身智能 机器人 大模型 研报 东方财富 2024",
    "招商证券 机器人 碳纤维 轻量化 研报 东方财富 2024",
    "东吴证券 丝杠 人形机器人 贝斯特 研报 东方财富 2024",
    "天风证券 灵巧手 因时机器人 末端执行器 研报 东方财富 2024",
    "国信证券 人形机器人 传感器 感知 研报 东方财富 2024",
  ];

  const results: Record<string, Array<{title:string;url:string}>> = {};

  for (const q of queries) {
    try {
      const resp = await fetch(
        "https://app-csctj2dvhmo1-api-DYJwo27V8Qya-gateway.appmiaoda.com/v2/ai_search/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Gateway-Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: q }],
            resource_type_filter: [{ type: "web", top_k: 5 }],
            enable_deep_search: false,
            enable_reasoning: false,
          }),
        }
      );

      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let refs: Array<{title:string;url:string}> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const js = line.slice(6).trim();
          if (js === "[DONE]") continue;
          try {
            const p = JSON.parse(js);
            if (p.references?.length) refs = p.references.map((r: {title:string;url:string}) => ({ title: r.title, url: r.url }));
          } catch { /* skip */ }
        }
      }
      results[q.slice(0, 20)] = refs.slice(0, 5);
    } catch (e) {
      results[q.slice(0, 20)] = [{ title: "error", url: String(e) }];
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
