import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { RESUME_PROMPT } from "../agent/prompt.js";
import { enrichResume } from "./enrich.js";

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("❌ DEEPSEEK_API_KEY is missing in environment variables");
}

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
});

const root = process.cwd();

const inputPath = path.join(root, "resumes/input.md");
const outputPath = path.join(root, "resumes/output.json");
const webPath = path.join(root, "web/src/resume.json");

const input = fs.readFileSync(inputPath, "utf-8");

console.log("🚀 Running local resume builder (DeepSeek)...");

const completion = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [
    { role: "system", content: RESUME_PROMPT },
    { role: "user", content: input }
  ],
  response_format: { type: "json_object" }
});

const json = JSON.parse(completion.choices[0].message.content);

const enriched = enrichResume(json);
if (enriched) {
  console.log("ℹ️ Applied enrichment patch (fixed content, privacy)");
}

fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
fs.writeFileSync(webPath, JSON.stringify(json, null, 2));

console.log("✅ Resume generated locally");
