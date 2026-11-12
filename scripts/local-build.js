import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { RESUME_PROMPT } from "../agent/prompt.js";
import { enrichResume } from "./enrich.js";
import { translateResume } from "./translate.js";

// 配置错误使用独立退出码，便于 CI 区分「配置问题」和「生成失败」
const EXIT_CONFIG_ERROR = 78;

const apiKey = (process.env.DEEPSEEK_API_KEY || "").trim();

if (!apiKey) {
  console.error("❌ DEEPSEEK_API_KEY is missing in environment variables");
  console.error("");
  console.error("   本地运行：先设置环境变量，例如");
  console.error("     Windows (cmd)      : set DEEPSEEK_API_KEY=sk-xxx");
  console.error("     Windows (PowerShell): $env:DEEPSEEK_API_KEY=\"sk-xxx\"");
  console.error("     bash / zsh         : export DEEPSEEK_API_KEY=sk-xxx");
  console.error("");
  console.error("   GitHub Actions：仓库 Settings → Secrets and variables → Actions");
  console.error("     新建 Repository secret，名称必须是 DEEPSEEK_API_KEY（区分大小写）");
  console.error(`     地址：https://github.com/${process.env.GITHUB_REPOSITORY || "<owner>/<repo>"}/settings/secrets/actions`);
  process.exit(EXIT_CONFIG_ERROR);
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.deepseek.com"
});

const root = process.cwd();

const inputPath = path.join(root, "resumes/input.md");
const outputPath = path.join(root, "resumes/output.json");
const webPath = path.join(root, "web/src/resume.json");
const outputEnPath = path.join(root, "resumes/output.en.json");
const webEnPath = path.join(root, "web/src/resume.en.json");

if (!fs.existsSync(inputPath)) {
  console.error(`❌ 找不到输入文件：${inputPath}`);
  process.exit(EXIT_CONFIG_ERROR);
}

const input = fs.readFileSync(inputPath, "utf-8");

console.log("🚀 Running local resume builder (DeepSeek)...");
console.log(`   输入：${inputPath}（${input.length} 字符）`);

let completion;
try {
  completion = await client.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    messages: [
      { role: "system", content: RESUME_PROMPT },
      { role: "user", content: input }
    ],
    response_format: { type: "json_object" }
  });
} catch (err) {
  console.error("❌ 调用 DeepSeek 接口失败：");
  console.error(`   ${err?.status || ""} ${err?.message || err}`);
  if (err?.status === 401) {
    console.error("   401 表示 API Key 无效或已被吊销，请到 platform.deepseek.com 重新生成。");
  } else if (err?.status === 402) {
    console.error("   402 表示账户余额不足，请充值后再试。");
  }
  process.exit(1);
}

const raw = completion.choices?.[0]?.message?.content;
if (!raw) {
  console.error("❌ DeepSeek 返回内容为空，未写入任何文件（保留上一版 JSON）。");
  process.exit(1);
}

let json;
try {
  json = JSON.parse(raw);
} catch (err) {
  console.error(`❌ 模型返回的不是合法 JSON：${err.message}`);
  process.exit(1);
}

if (!json || typeof json !== "object" || !json.basics) {
  console.error("❌ 模型返回的 JSON 缺少 basics 字段，疑似生成不完整，未写入文件。");
  process.exit(1);
}

const enriched = enrichResume(json);
if (enriched) {
  console.log("ℹ️ Applied enrichment patch (fixed content, privacy)");
}

for (const target of [outputPath, webPath]) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(json, null, 2));
  console.log(`   已写入：${target}`);
}

if (completion.usage) {
  console.log(`   用量：prompt=${completion.usage.prompt_tokens} completion=${completion.usage.completion_tokens}`);
}

console.log("✅ Resume generated locally");

// 英文版：翻译失败不影响中文版产出，也不覆盖仓库中已有的英文 JSON
console.log("🌐 Translating to English...");
try {
  const { json: enJson, usage } = await translateResume(json);
  for (const target of [outputEnPath, webEnPath]) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(enJson, null, 2));
    console.log(`   已写入：${target}`);
  }
  if (usage) {
    console.log(`   用量：prompt=${usage.prompt_tokens} completion=${usage.completion_tokens}`);
  }
  console.log("✅ English resume generated");
} catch (err) {
  console.warn(`⚠️  英文版生成失败，保留仓库中已有的英文 JSON：${err.message}`);
}
