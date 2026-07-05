import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// AI 分析结果结构
interface EventAnalysis {
  factors: string[];   // 驱动因素（2-4个）
  outcomes: string[];  // 预期结果（2-4个）
  sentiment: "positive" | "negative" | "neutral"; // 利好/利空/中性
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { event_id, title } = await req.json() as { event_id: string; title: string };
    if (!event_id || !title) {
      return new Response(
        JSON.stringify({ error: "缺少 event_id 或 title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "缺少 INTEGRATIONS_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 调用 MiniMax-M3 进行结构化分析
    const prompt = `你是一位专业的机器人产业投资分析师。请对以下新闻资讯进行简洁的投资分析，严格按JSON格式返回，不要有任何其他文字。

新闻标题：${title}

分析要求：
1. factors: 列举2-4个导致此事件的核心驱动因素（每条不超过12字）
2. outcomes: 列举2-4个此事件可能带来的市场影响或结果（每条不超过12字）
3. sentiment: 对机器人产业投资的整体性质，只能是 "positive"（利好）、"negative"（利空）、"neutral"（中性）之一

严格返回如下JSON格式，不得包含任何解释：
{
  "factors": ["因素1", "因素2"],
  "outcomes": ["结果1", "结果2"],
  "sentiment": "positive"
}`;

    const mmResp = await fetch(
      "https://app-csctj2dvhmo1-api-rLobPAn0n7m9-gateway.appmiaoda.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gateway-Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "MiniMax-M3",
          thinking: { type: "disabled" }, // 关闭深度思考以加快速度
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_completion_tokens: 512,
        }),
      }
    );

    if (!mmResp.ok) {
      const errText = await mmResp.text();
      console.error(`MiniMax API 错误 ${mmResp.status}:`, errText);
      return new Response(
        JSON.stringify({ error: `AI 服务返回 ${mmResp.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mmData = await mmResp.json() as {
      choices: Array<{ message: { content: string } }>;
      base_resp?: { status_code: number; status_msg: string };
    };

    if (mmData.base_resp && mmData.base_resp.status_code !== 0) {
      console.error("MiniMax 业务错误:", mmData.base_resp);
      return new Response(
        JSON.stringify({ error: mmData.base_resp.status_msg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawContent = mmData.choices?.[0]?.message?.content || "";

    // 提取 JSON 内容
    let analysis: EventAnalysis;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("未找到 JSON");
      const parsed = JSON.parse(jsonMatch[0]) as Partial<EventAnalysis>;
      analysis = {
        factors: Array.isArray(parsed.factors) ? parsed.factors.slice(0, 4) : [],
        outcomes: Array.isArray(parsed.outcomes) ? parsed.outcomes.slice(0, 4) : [],
        sentiment: ["positive", "negative", "neutral"].includes(parsed.sentiment as string)
          ? (parsed.sentiment as EventAnalysis["sentiment"])
          : "neutral",
      };
    } catch (parseErr) {
      console.error("解析 AI 返回 JSON 失败:", parseErr, "原文:", rawContent);
      return new Response(
        JSON.stringify({ error: "AI 返回格式解析失败" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 更新数据库
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from("events")
      .update({ analysis })
      .eq("id", event_id);

    if (dbError) {
      console.error("更新 events.analysis 失败:", dbError);
      return new Response(
        JSON.stringify({ error: "数据库更新失败" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`事件 ${event_id} 分析完成: sentiment=${analysis.sentiment}`);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("analyze-event 错误:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
