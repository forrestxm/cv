import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { RESUME_PROMPT } from "./prompt.js";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY is missing in environment variables");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const root = process.cwd();

const inputPath = path.join(root, "resumes/input.md");
const outputPath = path.join(root, "resumes/output.json");

const input = fs.readFileSync(inputPath, "utf-8");

const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: [
    { role: "system", content: RESUME_PROMPT },
    { role: "user", content: input }
  ]
});

const json = JSON.parse(response.output_text);

fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));

console.log("✅ Resume generated");