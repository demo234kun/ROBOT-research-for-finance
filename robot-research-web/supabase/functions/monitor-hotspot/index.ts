// 实时监控：热点新闻AI分析 + 当日投资建议
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MINIMAX_URL =
  "https://app-csctj2dvhmo1-api-rLobPAn0n7m9-gateway.appmiaoda.com/v1/chat/completions";

// 机器人产业链板块映射
const SECTOR_STOCKS: Record<string, { sector: string; stocks: string[] }> = {
  "减速器": { sector: "减速器", stocks: ["绿的谐波", "双环传动", "中大力德", "昊盛工业", "来福谐波"] },
  "伺服": { sector: "伺服电机", stocks: ["汇川技术", "鸣志电器", "英威腾", "步科股份", "禾川科技"] },
  "执行器": { sector: "执行器/热管理", stocks: ["三花智控", "拓普集团", "中鼎股份"] },
  "磁材": { sector: "永磁材料", stocks: ["金力永磁", "中科三环", "宁波韵升", "大地熊"] },
  "控制器": { sector: "控制系统", stocks: ["汇川技术", "禾川科技", "固高科技"] },
  "传感器": { sector: "传感器", stocks: ["奥比中光", "灵动科技", "芯动联科"] },
  "本体": { sector: "本体制造", stocks: ["埃斯顿", "汇博股份", "节卡股份", "宇树", "优必选"] },
  "轻量化": { sector: "轻量化材料", stocks: ["南山铝业", "宝武镁业", "金发科技"] },
  "电池": { sector: "电源/电池", stocks: ["宁德时代", "派能科技", "德赛西威"] },
  "人形": { sector: "人形机器人", stocks: ["特斯拉(TSLA)", "优必选", "傅利叶", "宇树", "智元"] },
};

interface HotspotNews {
  id: string;
  title: string;
  published_at: string;
  platform: string;
  url: string;
  analysis?: {
    sentiment: string;
    factors: string[];
    outcomes: string[];
  } | null;
}

interface EnhancedNews {
  id: string;
  title: string;
  published_at: string;
  platform: string;
  url: string;
  sentiment: "positive" | "negative" | "neutral";
  reason: string;         // 一句话原因
  affected_sectors: string[]; // 影响的板块
  related_stocks: string[];   // 相关股票
  impact_desc: string;    // 影响描述
}

async function callMiniMax(apiKey: string, prompt: string): Promise<string> {
  const resp = await fetch(MINIMAX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Gateway-Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "MiniMax-M3",
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    }),
  });
  if (!resp.ok) throw new Error(`MiniMax ${resp.status}`);
  const data = await resp.json() as {
    choices: Array<{ message: { content: string } }>;
    base_resp?: { status_code: number; status_msg: string };
  };
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(data.base_resp.status_msg);
  }
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const m = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!m) return fallback;
    return JSON.parse(m[0]) as T;
  } catch {
    return fallback;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
    if (!apiKey) throw new Error("缺少 INTEGRATIONS_API_KEY");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // 1. 拉取今日最新 8 条事件
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: rawEvents, error: evErr } = await sb
      .from("events")
      .select("id, title, published_at, platform, url, analysis")
      .gte("published_at", today.toISOString())
      .order("published_at", { ascending: false })
      .limit(8);

    if (evErr) throw new Error(evErr.message);

    const events: HotspotNews[] = rawEvents ?? [];

    // 若当日无数据，取最近8条
    if (events.length === 0) {
      const { data: recent } = await sb
        .from("events")
        .select("id, title, published_at, platform, url, analysis")
        .order("published_at", { ascending: false })
        .limit(8);
      events.push(...(recent ?? []));
    }

    if (events.length === 0) {
      return new Response(JSON.stringify({ hotspots: [], suggestion: "暂无足够新闻数据，请稍后重试。" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. 批量AI增强分析（并行）
    const sectorList = Object.keys(SECTOR_STOCKS).join("、");
    const enhanced: EnhancedNews[] = await Promise.all(
      events.map(async (ev) => {
        const prompt = `你是专业的机器人产业投资分析师。请分析以下新闻对机器人产业链的影响，严格按JSON格式返回。

新闻标题：${ev.title}

机器人产业链板块（从中选择相关的，可多选）：${sectorList}

请返回如下JSON，不得包含任何其他文字：
{
  "sentiment": "positive" 或 "negative" 或 "neutral",
  "reason": "一句话说明为何产生此影响（15字以内）",
  "affected_sectors": ["板块1", "板块2"],
  "related_stocks": ["股票1", "股票2", "股票3"],
  "impact_desc": "对机器人板块的具体影响描述（30字以内）"
}

注意：related_stocks 从产业链中选最相关的2-4只股票名（中文名），affected_sectors 从给定板块名中选。`;

        try {
          const raw = await callMiniMax(apiKey, prompt);
          const parsed = parseJSON<Partial<EnhancedNews>>(raw, {});
          return {
            id: ev.id,
            title: ev.title,
            published_at: ev.published_at,
            platform: ev.platform,
            url: ev.url,
            sentiment: (["positive", "negative", "neutral"].includes(parsed.sentiment as string)
              ? parsed.sentiment : ev.analysis?.sentiment ?? "neutral") as "positive" | "negative" | "neutral",
            reason: parsed.reason ?? ev.analysis?.factors?.[0] ?? "影响分析中",
            affected_sectors: (parsed.affected_sectors as string[]) ?? [],
            related_stocks: (parsed.related_stocks as string[]) ?? [],
            impact_desc: parsed.impact_desc ?? "",
          };
        } catch {
          return {
            id: ev.id,
            title: ev.title,
            published_at: ev.published_at,
            platform: ev.platform,
            url: ev.url,
            sentiment: (ev.analysis?.sentiment as "positive" | "negative" | "neutral") ?? "neutral",
            reason: ev.analysis?.factors?.[0] ?? "分析失败",
            affected_sectors: [],
            related_stocks: [],
            impact_desc: "",
          };
        }
      })
    );

    // 3. 生成当日建议
    const positiveNews = enhanced.filter(e => e.sentiment === "positive").map(e => e.title).join("；");
    const negativeNews = enhanced.filter(e => e.sentiment === "negative").map(e => e.title).join("；");

    const suggPrompt = `你是专业的机器人产业投资分析师。请根据今日新闻综合生成当日投资建议。

利好新闻：${positiveNews || "无"}
利空新闻：${negativeNews || "无"}

请返回如下JSON，不得包含任何其他文字：
{
  "overall": "positive" 或 "negative" 或 "neutral",
  "summary": "今日市场整体判断（20字以内）",
  "buy_suggestion": "建议关注的买入方向（30字以内，无则填'暂无明确买点'）",
  "sell_warning": "需要警惕的风险（30字以内，无则填'暂无明显风险'）",
  "key_stocks": ["重点关注股票1", "重点关注股票2", "重点关注股票3"],
  "strategy": "今日综合操作策略（60字以内）"
}`;

    let suggestion = {
      overall: "neutral" as "positive" | "negative" | "neutral",
      summary: "数据不足，请刷新",
      buy_suggestion: "暂无明确买点",
      sell_warning: "暂无明显风险",
      key_stocks: [] as string[],
      strategy: "请等待更多信号",
    };
    try {
      const rawSugg = await callMiniMax(apiKey, suggPrompt);
      const parsed = parseJSON<typeof suggestion>(rawSugg, suggestion);
      if (parsed.summary) suggestion = { ...suggestion, ...parsed };
    } catch { /* 使用默认 */ }

    return new Response(
      JSON.stringify({ hotspots: enhanced, suggestion }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("monitor-hotspot 错误:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
