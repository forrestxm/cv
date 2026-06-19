import fs from "fs";
import OpenAI from "openai";
import { RESUME_PROMPT } from "./prompt.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const input = fs.readFileSync("../resumes/input.md", "utf-8");

const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: [
    {
      role: "system",
      content: RESUME_PROMPT
    },
    {
      role: "user",
      content: input
    }
  ]
});

const json = JSON.parse(response.output_text);

fs.writeFileSync("../resumes/output.json", JSON.stringify(json, null, 2));

console.log("✅ Resume generated");