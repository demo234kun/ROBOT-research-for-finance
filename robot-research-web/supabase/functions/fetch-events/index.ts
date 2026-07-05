import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ─── 类型定义 ───────────────────────────────────────────────
interface NewsItem {
  title: string;
  url: string;
  source: string;
  platform: string;
  published_at: string;
}

// ─── 机器人相关关键词过滤 ───────────────────────────────────
const ROBOT_KEYWORDS = [
  "机器人", "人形", "工业机器人", "协作机器人", "减速器", "伺服", "末端执行器",
  "传感器", "控制器", "Optimus", "Figure", "Boston Dynamics", "波士顿动力",
  "优必选", "宇树", "傅利叶", "智元", "宁德时代机器人", "特斯拉机器人",
  "humanoid", "robotics", "AMR", "AGV", "SCARA"
];

function isRobotRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return ROBOT_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// ─── CLS 财联社：签名算法 ─────────────────────────────────
function clsSerializeValue(value: unknown, key: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return `${key}=${value}`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `${key}[]`;
    return value
      .map((item, i) => clsSerializeValue(item, `${key}[${i}]`))
      .filter(Boolean)
      .join("&");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort((a, b) => String(a).toUpperCase().localeCompare(String(b).toUpperCase()))
      .map(k => clsSerializeValue(obj[k], `${key}[${k}]`))
      .filter(Boolean)
      .join("&");
  }
  return null;
}

async function clsSign(params: Record<string, unknown>): Promise<string> {
  const serialized = Object.keys(params)
    .sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()))
    .map(k => clsSerializeValue(params[k], k))
    .filter(Boolean)
    .join("&");

  // SHA1
  const sha1Buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(serialized));
  const sha1Hex = Array.from(new Uint8Array(sha1Buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  // MD5
  const md5Buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sha1Hex));
  const md5Hex = Array.from(new Uint8Array(md5Buf)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  return md5Hex;
}

// ─── 1. CLS 财联社电报 ────────────────────────────────────
async function fetchCLS(): Promise<NewsItem[]> {
  const params: Record<string, unknown> = {
    refresh_type: 1,
    rn: 50,
    last_time: 0,
    os: "web",
    sv: "8.7.9",
    app: "CailianpressWeb",
  };
  try {
    params.sign = await clsSign(params);
    const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
    const resp = await fetch(`https://www.cls.cn/v1/roll/get_roll_list?${qs}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.cls.cn/telegraph",
      },
    });
    const data = await resp.json();
    const items: NewsItem[] = [];
    for (const item of data?.data?.roll_data || []) {
      const title = stripHtml(item.brief || item.content || "").slice(0, 120);
      if (!title) continue;
      if (!isRobotRelated(title + (item.content || ""))) continue;
      items.push({
        title,
        url: `https://www.cls.cn/telegraph/${item.id}`,
        source: "财联社",
        platform: "cls",
        published_at: new Date(item.ctime * 1000).toISOString(),
      });
    }
    console.log(`CLS 财联社：过滤后 ${items.length} 条`);
    return items;
  } catch (err) {
    console.error("CLS 抓取失败:", err);
    return [];
  }
}

// ─── 2. 东方财富快讯 ─────────────────────────────────────
async function fetchEastMoney(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  // 使用搜索 API（带关键词）
  const searchUrl = "https://search-api-web.eastmoney.com/search/jsonp?cb=jQuery&param=" +
    encodeURIComponent(JSON.stringify({
      uid: "", keyword: "机器人",
      type: ["cmsArticleWebOld"],
      client: "web", clientType: "web", clientVersion: "curr",
      param: {
        cmsArticleWebOld: {
          searchScope: "default", sort: "default",
          pageIndex: 1, pageSize: 20, preTag: "", postTag: ""
        }
      }
    }));
  try {
    const resp = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://so.eastmoney.com/",
      },
    });
    const text = await resp.text();
    const jsonStr = text.replace(/^jQuery\(/, "").replace(/\)\s*$/, "");
    const data = JSON.parse(jsonStr);
    for (const article of data?.result?.cmsArticleWebOld || []) {
      if (!article.title || !article.url) continue;
      items.push({
        title: stripHtml(article.title).slice(0, 120),
        url: article.url.startsWith("http") ? article.url : `https:${article.url}`,
        source: article.mediaName || article.source || "东方财富",
        platform: "eastmoney",
        published_at: article.date || new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("东方财富搜索失败:", err);
  }
  // 快讯流（7x24，全量后过滤）
  try {
    const resp2 = await fetch(
      "https://newsapi.eastmoney.com/kuaixun/v1/getlist_102_ajaxResult_50_1_.html",
      { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://kuaixun.eastmoney.com/" } }
    );
    const text2 = await resp2.text();
    const m = text2.match(/var ajaxResult=(\{.*?\});/s);
    if (m) {
      const result = JSON.parse(m[1]);
      for (const item of result.LivesList || []) {
        if (!item.title) continue;
        if (!isRobotRelated(item.title + (item.digest || ""))) continue;
        items.push({
          title: stripHtml(item.title).slice(0, 120),
          url: `https://kuaixun.eastmoney.com/a/${item.newsid || ""}`,
          source: "东方财富快讯",
          platform: "eastmoney",
          published_at: item.showtime
            ? new Date(item.showtime.replace(" ", "T") + "+08:00").toISOString()
            : new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("东方财富快讯失败:", err);
  }
  console.log(`东方财富：${items.length} 条`);
  return items;
}

// ─── 3. 同花顺快讯（通过 Jina Reader 代理，绕过服务器端 IP 封锁） ──────
async function fetchTHS(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  try {
    const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
    if (!apiKey) {
      console.error("同花顺：缺少 INTEGRATIONS_API_KEY，跳过");
      return items;
    }

    const thsApiUrl = "https://news.10jqka.com.cn/tapp/news/push/stock/?page=1&tag=&track=website&pagesize=50";
    const encodedUrl = encodeURIComponent(thsApiUrl);
    const jinaUrl = `https://app-csctj2dvhmo1-api-ELbWqODdAgNY-gateway.appmiaoda.com/${encodedUrl}`;

    const resp = await fetch(jinaUrl, {
      headers: {
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
        "X-Return-Format": "text",
      },
    });

    if (!resp.ok) {
      console.error(`同花顺：Jina 代理返回 ${resp.status}`);
      return items;
    }

    // Jina 返回格式：纯文本，可能包含 "Markdown Content:" 前缀，需提取 JSON
    const rawText = await resp.text();

    // 从文本中提取 JSON 对象（同花顺 API 直接返回 JSON 字符串）
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("同花顺：无法从 Jina 返回内容中提取 JSON");
      return items;
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("同花顺：JSON 解析失败");
      return items;
    }

    const list = (data as { data?: { list?: Record<string, unknown>[] } })?.data?.list || [];
    for (const item of list) {
      const title = item.title as string | undefined;
      if (!title) continue;
      if (!isRobotRelated(title + ((item.digest as string) || "") + ((item.remark as string) || ""))) continue;
      // 优先使用接口返回的完整 url 字段，拼接的 seq 链接是死链
      const itemUrl = (item.url as string) ||
        (item.appUrl as string) ||
        `https://news.10jqka.com.cn/m${(item.seq as string) || ""}/`;
      items.push({
        title: stripHtml(title).slice(0, 120),
        url: itemUrl,
        source: "同花顺",
        platform: "ths",
        published_at: new Date(parseInt((item.ctime as string) || "0") * 1000).toISOString(),
      });
    }
    console.log(`同花顺：过滤后 ${items.length} 条`);
  } catch (err) {
    console.error("同花顺快讯失败:", err);
  }
  return items;
}

// ─── 4. 华尔街见闻 ────────────────────────────────────────
async function fetchWallstreetcn(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  try {
    const resp = await fetch(
      "https://api-one-wscn.awtmt.com/apiv1/content/lives?channel=global-channel&client=pc&limit=50",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json,text/plain,*/*",
          "Referer": "https://wallstreetcn.com/live",
        },
      }
    );
    const data = await resp.json();
    for (const item of data?.data?.items || []) {
      const text = item.content_text || stripHtml(item.content || "");
      const title = item.title || text.slice(0, 80);
      if (!title) continue;
      if (!isRobotRelated(title + text)) continue;
      const ts = item.display_time || item.created_at || 0;
      items.push({
        title: title.slice(0, 120),
        url: item.uri || `https://wallstreetcn.com/livenews/${item.id || ""}`,
        source: "华尔街见闻",
        platform: "wallstreetcn",
        published_at: new Date(parseInt(String(ts)) * 1000).toISOString(),
      });
    }
    console.log(`华尔街见闻：过滤后 ${items.length} 条`);
  } catch (err) {
    console.error("华尔街见闻抓取失败:", err);
  }
  return items;
}

// ─── 5. 雪球用户动态 ──────────────────────────────────────
// 需要配置 Supabase Secrets：XUEQIU_COOKIE、XUEQIU_UIDS（逗号分隔 UID）
async function fetchXueqiu(): Promise<NewsItem[]> {
  const cookie = Deno.env.get("XUEQIU_COOKIE");
  const uidsRaw = Deno.env.get("XUEQIU_UIDS") || "";
  if (!cookie || !uidsRaw.trim()) {
    console.log("雪球：未配置 XUEQIU_COOKIE 或 XUEQIU_UIDS，跳过");
    return [];
  }

  const uids = uidsRaw.split(",").map(u => u.trim()).filter(Boolean);
  const items: NewsItem[] = [];

  for (const uid of uids) {
    try {
      const url = `https://stock.xueqiu.com/v4/statuses/user_timeline.json?user_id=${uid}&page=1&count=20&type=0`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Referer": `https://xueqiu.com/u/${uid}`,
          "Origin": "https://xueqiu.com",
          "Cookie": cookie,
        },
      });

      if (!resp.ok) {
        console.error(`雪球 UID ${uid} 请求失败: ${resp.status}`);
        continue;
      }

      const data = await resp.json();
      const statuses = data?.statuses || data?.data?.statuses || [];
      const userName: string = statuses[0]?.user?.screen_name || `雪球用户${uid}`;

      for (const item of statuses) {
        const rawText = item.description || item.text || "";
        const title = (item.title || stripHtml(rawText)).slice(0, 120);
        if (!title) continue;
        if (!isRobotRelated(title + rawText)) continue;

        const createdMs = item.created_at || 0;
        // 雪球时间戳单位为毫秒
        const pubDate = new Date(typeof createdMs === "number" && createdMs > 1e12
          ? createdMs
          : createdMs * 1000
        ).toISOString();

        items.push({
          title,
          url: `https://xueqiu.com/${uid}/${item.id || ""}`,
          source: `雪球·${userName}`,
          platform: "xueqiu",
          published_at: pubDate,
        });
      }
      console.log(`雪球 UID ${uid}（${userName}）：过滤后 ${items.filter(i => i.source.includes(userName)).length} 条`);
    } catch (err) {
      console.error(`雪球 UID ${uid} 抓取失败:`, err);
    }
  }
  return items;
}

// ─── 6. 金十数据 ──────────────────────────────────────────
async function fetchJin10(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];
  try {
    // 动态从前端 bundle 提取 x-app-id
    const baseHeaders = { "User-Agent": "Mozilla/5.0", "Referer": "https://www.jin10.com/" };
    const html = await (await fetch("https://www.jin10.com/", { headers: baseHeaders })).text();
    const scriptMatch = html.match(/(?:https:)?\/\/www\.jin10\.com\/new\/js\/index\.[^"']+\.js/);
    if (!scriptMatch) throw new Error("找不到金十 bundle");
    const scriptUrl = scriptMatch[0].startsWith("//") ? "https:" + scriptMatch[0] : scriptMatch[0];
    const bundle = await (await fetch(scriptUrl, { headers: baseHeaders })).text();
    const appIdMatch = bundle.match(/"x-app-id":"([^"]+)"/);
    if (!appIdMatch) throw new Error("找不到金十 x-app-id");

    const jin10Headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json,text/plain,*/*",
      "Referer": "https://www.jin10.com/",
      "Origin": "https://www.jin10.com",
      "x-app-id": appIdMatch[1],
      "x-version": "1.0.0",
    };
    const resp = await fetch(
      "https://flash-api.jin10.com/get_flash_list?channel=-8200&limit=50",
      { headers: jin10Headers }
    );
    const data = await resp.json();
    for (const item of data?.data || []) {
      const d = item.data || {};
      const content = stripHtml(d.content || d.title || "");
      const title = (d.title || content).slice(0, 120);
      if (!title) continue;
      if (!isRobotRelated(title + content)) continue;
      let pubDate = new Date().toISOString();
      try {
        const dt = new Date(item.time.replace(" ", "T") + "+08:00");
        pubDate = dt.toISOString();
      } catch { /**/ }
      items.push({
        title,
        url: d.source_link || `https://flash.jin10.com/detail/${item.id || ""}`,
        source: "金十数据",
        platform: "jin10",
        published_at: pubDate,
      });
    }
    console.log(`金十数据：过滤后 ${items.length} 条`);
  } catch (err) {
    console.error("金十数据抓取失败:", err);
  }
  return items;
}

// ─── 主 Handler ───────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 并发抓取所有平台
    const [cls, em, ths, wscn, jin10, xueqiu] = await Promise.allSettled([
      fetchCLS(),
      fetchEastMoney(),
      fetchTHS(),
      fetchWallstreetcn(),
      fetchJin10(),
      fetchXueqiu(),
    ]);

    const allNews: NewsItem[] = [
      ...(cls.status === "fulfilled" ? cls.value : []),
      ...(em.status === "fulfilled" ? em.value : []),
      ...(ths.status === "fulfilled" ? ths.value : []),
      ...(wscn.status === "fulfilled" ? wscn.value : []),
      ...(jin10.status === "fulfilled" ? jin10.value : []),
      ...(xueqiu.status === "fulfilled" ? xueqiu.value : []),
    ];

    const platformStats = {
      cls: cls.status === "fulfilled" ? cls.value.length : 0,
      eastmoney: em.status === "fulfilled" ? em.value.length : 0,
      ths: ths.status === "fulfilled" ? ths.value.length : 0,
      wallstreetcn: wscn.status === "fulfilled" ? wscn.value.length : 0,
      jin10: jin10.status === "fulfilled" ? jin10.value.length : 0,
      xueqiu: xueqiu.status === "fulfilled" ? xueqiu.value.length : 0,
    };

    console.log("各平台抓取数量:", platformStats);
    console.log("汇总总条数:", allNews.length);

    if (allNews.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "未获取到新事件", inserted: 0, platform_stats: platformStats }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 去重插入（URL 唯一约束冲突自动跳过）
    let inserted = 0;
    const newEventIds: Array<{ id: string; title: string }> = [];
    for (const item of allNews) {
      const { data: insertedRow, error } = await supabase.from("events").insert({
        title: item.title,
        url: item.url,
        source: item.source,
        platform: item.platform,
        published_at: item.published_at,
      }).select("id, title").maybeSingle();
      if (!error && insertedRow) {
        inserted++;
        newEventIds.push({ id: insertedRow.id, title: insertedRow.title });
      }
    }

    // Fire-and-forget：对新增事件异步触发 AI 分析（不阻塞响应）
    const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/analyze-event`;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (newEventIds.length > 0) {
      (async () => {
        for (const evt of newEventIds) {
          try {
            await fetch(functionUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({ event_id: evt.id, title: evt.title }),
            });
          } catch (e) {
            console.error(`AI 分析触发失败 [${evt.id}]:`, e);
          }
        }
      })();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `成功汇总 ${allNews.length} 条事件，新增 ${inserted} 条`,
        inserted,
        total_fetched: allNews.length,
        platform_stats: platformStats,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("fetch-events 错误:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});