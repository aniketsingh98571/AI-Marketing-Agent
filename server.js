// server.js (ESM)
import express from "express";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const groundingTool = {
  googleSearch: {},
};

const config = {
  tools: [groundingTool],
};

const app = express();
const gemini_key = "";
const ai = new GoogleGenAI({ apiKey: gemini_key });
// const genAI = new GoogleGenAI(gemini_key)
app.use(express.json({ limit: "200kb" }));

const UA = "ProcedureScraper/0.1 (+https://procedure.tech;";

// POST /scrape  { "url": "https://example.com", "rendered": false, "post_topic": { "topic": "...", "focus": "...", "audience_regions": [...] } }
app.post("/scrape", async (req, res) => {
  try {
    const { url, rendered = false, post_topic } = req.body || {};
    console.log(url, "url");
    console.log(post_topic, "post_topic");

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ error: "Body must include a string 'url'." });
    }

    // Validate post_topic structure
    if (!post_topic || typeof post_topic !== "object") {
      return res.status(400).json({
        error:
          "Body must include a 'post_topic' object with topic, focus, and audience_regions.",
      });
    }

    const { topic, focus, audience_regions } = post_topic;

    if (!topic || !focus || !audience_regions) {
      return res.status(400).json({
        error:
          "post_topic must include 'topic', 'focus', and 'audience_regions' fields.",
      });
    }

    // Convert audience regions array to string format
    const audienceRegionsStr = Array.isArray(audience_regions)
      ? audience_regions.join(", ")
      : audience_regions;

    // Basic URL sanity check
    let target;
    try {
      target = new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL." });
    }
    if (!/^https?:$/.test(target.protocol)) {
      return res
        .status(400)
        .json({ error: "Only http/https URLs are allowed." });
    }

    // Fetch raw server HTML (fast path)
    if (!rendered) {
      const { data: html } = await axios.get(target.toString(), {
        headers: { "User-Agent": UA, Accept: "text/html" },
        timeout: 15000,
        maxRedirects: 5,
      });
      console.log(html, "html");

      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const webSearchConfig = {
        ...config,
        systemInstruction: `You are a research assistant that crafts high-signal, up-to-date web search queries.
Your job is to output concise, diverse queries and entities to discover *recent* news,
releases, benchmarks, incidents, analysis, and authoritative commentary.

Rules
- Return results as a Markdown bulleted list (no JSON).
- Provide 6–12 search queries, each with a short reason.
- After queries, add a separate bulleted list of 5–10 related entities (people, orgs, tools, standards, events).
- Prefer freshness: last 30–60 days; include operators like site:, intitle:, "…" where useful.
- Include at least one non-English query if the topic trends globally.
- Never invent facts, only propose *queries*.

`,
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Topic: ${topic}
Focus: ${focus}
Audience regions: ${audienceRegionsStr}`,
        config: webSearchConfig,
      });

      console.log(response.text, "model response");

      console.log(text, "txt");

      const framedResponse = {
        modelResponse: response.text,
        scrappedText: text,
      };

      const responsePrompt = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You will be provided a JSON: { "modelResponse": string, "scrappedText": string }. ${JSON.stringify(
          framedResponse
        )}
Use it to write one LinkedIn post per OutputSchema.

If scrappedText is thin or generic:
- Focus on thought leadership anchored to the trends and position our POV,
  then include a soft bridge to our capabilities without fabricated claims.

If there are multiple plausible angles:
- Choose ONE, and state it in metadata.angle.

Return the output in a string`,
        config: {
          systemInstruction: `You are a senior marketing writer for a software/AI consultancy.
Write a LinkedIn post in Markdown.

Rules
- Input: scrappedText (our services) + modelResponse (trends).
- Output: a single polished LinkedIn post in Markdown (not JSON).
- Length: 700–1,100 characters unless asked otherwise.
- Start with a strong hook.
- Weave in 1–2 trend insights and connect them to our services (from scrappedText).
- End with a clear CTA.
- Use 3–5 hashtags at the bottom.
- No emojis unless explicitly requested.
- Do NOT invent features/clients; only use scrappedText + modelResponse.

`,
          thinkingConfig: {
            thinkingBudget: 1024,
            // Turn off thinking:
            // thinkingBudget: 0
            // Turn on dynamic thinking:
            // thinkingBudget: -1
          },
        },
      });

      return res.json({
        ok: true,
        url: target.toString(),
        html,
        text,
        modelResponse: response,
        post: responsePrompt.text,
      });
    }

    // OPTIONAL: rendered=true with Puppeteer (uncomment if needed)
    // import puppeteer from "puppeteer";
    // const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    // const page = await browser.newPage();
    // await page.setUserAgent(UA);
    // await page.goto(target.toString(), { waitUntil: "networkidle2", timeout: 30000 });
    // const html = await page.content();
    // await browser.close();
    // const text = html
    //   .replace(/<script[\s\S]*?<\/script>/gi, "")
    //   .replace(/<style[\s\S]*?<\/style>/gi, "")
    //   .replace(/<[^>]+>/g, " ")
    //   .replace(/\s+/g, " ")
    //   .trim();
    // return res.json({ ok: true, url: target.toString(), html, text });
  } catch (e) {
    console.log(e, "error");
    const message = e?.response?.status
      ? `Upstream ${e.response.status} ${e.response.statusText}`
      : e?.message || "fetch failed";
    return res.status(500).json({ ok: false, error: message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Scraper API running http://localhost:${PORT}`)
);
