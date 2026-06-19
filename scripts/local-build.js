import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { RESUME_PROMPT } from "../agent/prompt.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const root = process.cwd();

const inputPath = path.join(root, "resumes/input.md");
const outputPath = path.join(root, "resumes/output.json");
const webPath = path.join(root, "web/src/resume.json");

const input = fs.readFileSync(inputPath, "utf-8");

console.log("🚀 Running local Codex resume builder...");

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    { role: "system", content: RESUME_PROMPT },
    { role: "user", content: input }
  ]
});

const json = JSON.parse(response.output_text);

fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
fs.writeFileSync(webPath, JSON.stringify(json, null, 2));

console.log("✅ Resume generated locally");