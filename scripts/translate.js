import OpenAI from "openai";

// 中文简历 JSON → 英文简历 JSON 的翻译步骤。
// 设计原则：
// 1. 只翻译自然语言字段的值，结构、键名、日期、邮箱、URL 一律不动；
// 2. 结构校验严格（键集合 + 数组长度必须一致），任何偏差都视为失败，绝不写入半成品；
// 3. 失败不阻塞部署 —— 调用方保留仓库中已提交的英文 JSON。

const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const TRANSLATE_PROMPT = `You are a professional resume translator (Chinese → English) for a senior software engineering manager.

TASK: Translate the human-readable string values of the given resume JSON into natural, professional English.
Everything else must stay byte-identical.

## MUST NOT change
- JSON structure, key names, array order and array lengths
- Dates ("2026-05", "2019-08"), emails, URLs, "countryCode"
- Proper nouns: IBM, Dell EMC, Xincere Med, WebSphere, Connections, Terraform, Ansible,
  Kubernetes, Docker, GitLab, Jenkins, Java/Java EE, Node.js, ReactJS, MongoDB, ZenTao,
  AWS, Azure, Alibaba Cloud, GAMP 5, CSV, IQ/OQ/PQ, ALCOA++, CAPA, SBOM, OSS, SCA, SAST,
  GxP, QMS, RTM, URS, VP, RA, SOP, SDLC, BCP&DR, FDA, NMPA, PPD, ICON, MSD, eCOA, ePData
- Skill keywords that are product/technology names (keep as-is, do not translate)
- "level", "issuer", "date", "fluency" values

## Translation rules
- Use standard industry English used on software engineering resumes (past tense for achievements,
  present tense for ongoing responsibilities).
- 夏铭 → Forrest Xia（这是简历主人的英文名，任何出现「夏铭」的地方都用 Forrest Xia）;
  默沙东 → Merck (MSD); 石药 → CSPC; 翰森 → Hansoh; 凯诺 → Kainuo;
  再鼎 → Zai Lab; 鲁南制药 → Lunan Pharmaceutical.
- 华东师范大学 → East China Normal University; 计算机科学及应用 → Computer Science and Applications.
- Chinese certificates/trainings keep their English names if a proper noun, otherwise translate naturally.
- Company name "信华医药（Xincere Med）" → "Xincere Med".
- Position "研发负责人，软件开发经理" → "R&D Engineering Manager" (use exactly this wording).
- Keep highlights (职责/responsibilities) and achievements (成果) as separate arrays; do not merge,
  do not add, do not drop, do not reorder items.
- Do not invent facts, metrics, or technologies that are not in the source.
- Output ONLY the JSON object, no markdown fences, no commentary.`;

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// 结构一致性校验：键集合、数组长度递归比对
function sameShape(a, b, path = "$") {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      throw new Error(`结构不一致：${path} 数组长度 ${a.length} → ${Array.isArray(b) ? b.length : typeof b}`);
    }
    a.forEach((item, i) => sameShape(item, b[i], `${path}[${i}]`));
    return;
  }
  if (isPlainObject(a)) {
    if (!isPlainObject(b)) throw new Error(`结构不一致：${path} 应为对象`);
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.join(",") !== bk.join(",")) {
      throw new Error(`结构不一致：${path} 键为 [${bk}]，期望 [${ak}]`);
    }
    ak.forEach((k) => sameShape(a[k], b[k], `${path}.${k}`));
    return;
  }
  if (typeof b !== typeof a) throw new Error(`结构不一致：${path} 类型 ${typeof a} → ${typeof b}`);
}

export async function translateResume(zhJson) {
  const apiKey = (process.env.DEEPSEEK_API_KEY || "").trim();
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY 未配置，跳过英文版生成");

  const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: TRANSLATE_PROMPT },
      { role: "user", content: JSON.stringify(zhJson, null, 2) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) throw new Error("翻译接口返回空内容");

  let en;
  try {
    en = JSON.parse(raw);
  } catch (err) {
    throw new Error(`翻译结果不是合法 JSON：${err.message}`);
  }

  sameShape(zhJson, en);

  // 翻译后仍需保证中英字段语义一一对应，防止模型把职责/成果对调
  const zhWork = zhJson.work ?? [];
  const enWork = en.work ?? [];
  zhWork.forEach((job, i) => {
    const enJob = enWork[i];
    if (!enJob) return;
    if ((job.highlights?.length ?? 0) !== (enJob.highlights?.length ?? 0)) {
      throw new Error(`翻译结果 ${job.name} 的职责条数不一致`);
    }
    if ((job.achievements?.length ?? 0) !== (enJob.achievements?.length ?? 0)) {
      throw new Error(`翻译结果 ${job.name} 的成果条数不一致`);
    }
  });

  return { json: en, usage: completion.usage };
}

// 支持单独运行：node scripts/translate.js
// 只重译英文版，不动中文 JSON，便于手工微调后快速刷新英文内容
const invokedDirectly =
  process.argv[1] && /translate\.js$/.test(process.argv[1].replace(/\\/g, "/"));

if (invokedDirectly) {
  const fs = await import("fs");
  const path = await import("path");

  const root = process.cwd();
  const src = path.join(root, "resumes/output.json");
  const targets = [
    path.join(root, "resumes/output.en.json"),
    path.join(root, "web/src/resume.en.json")
  ];

  if (!fs.existsSync(src)) {
    console.error(`❌ 找不到中文版 JSON：${src}`);
    process.exit(1);
  }

  const zh = JSON.parse(fs.readFileSync(src, "utf-8"));
  console.log("🌐 Translating resume JSON to English...");

  try {
    const { json, usage } = await translateResume(zh);
    for (const target of targets) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, JSON.stringify(json, null, 2));
      console.log(`   已写入：${target}`);
    }
    if (usage) {
      console.log(`   用量：prompt=${usage.prompt_tokens} completion=${usage.completion_tokens}`);
    }
    console.log("✅ English resume JSON generated");
  } catch (err) {
    console.error(`❌ 英文版生成失败：${err.message}`);
    process.exit(1);
  }
}
