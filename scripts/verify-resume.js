import fs from "fs";
import path from "path";

// 部署前校验：中英文两套 JSON 必须存在、可解析、且结构可用
// 英文版由 scripts/translate.js 生成，web 端静态 import，缺失会直接导致构建失败
const root = process.cwd();
const targets = [
  "resumes/output.json",
  "web/src/resume.json",
  "resumes/output.en.json",
  "web/src/resume.en.json"
];

let ok = true;

// 语言一致性：英文版正文不应残留成片中文（专有名词与证书名可能保留，故只做比例判断）
const cjk = (s) => (String(s).match(/[\u4e00-\u9fa5]/g) || []).length;
const checkEnglish = (data, rel) => {
  const samples = [
    data?.basics?.summary,
    ...(data?.work ?? []).flatMap((w) => [w.position, w.summary, ...(w.highlights ?? []), ...(w.achievements ?? [])])
  ].filter(Boolean);
  const dirty = samples.filter((s) => cjk(s) / Math.max(String(s).length, 1) > 0.3);
  if (dirty.length) {
    console.warn(`⚠️  ${rel}：有 ${dirty.length} 处文本中文占比过高，可能未完成翻译`);
  }
};

for (const rel of targets) {
  const abs = path.join(root, rel);

  if (!fs.existsSync(abs)) {
    console.error(`❌ 缺少文件：${rel}`);
    ok = false;
    continue;
  }

  const size = fs.statSync(abs).size;
  if (size === 0) {
    console.error(`❌ 文件为空：${rel}`);
    ok = false;
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(abs, "utf-8"));
  } catch (err) {
    console.error(`❌ 不是合法 JSON：${rel} — ${err.message}`);
    ok = false;
    continue;
  }

  if (!data?.basics?.name) {
    console.error(`❌ 结构不完整（缺少 basics.name）：${rel}`);
    ok = false;
    continue;
  }

  // 工作经历必须区分「职责 highlights」与「成果 achievements」，否则线上会出现重复描述
  const norm = (s) => String(s ?? "").replace(/\s+/g, "").replace(/[，。；、,.;:：]/g, "");
  for (const job of data.work ?? []) {
    if (!Array.isArray(job.highlights) || !Array.isArray(job.achievements)) {
      console.error(`❌ ${rel}：工作经历「${job.name}」缺少 highlights/achievements 数组结构`);
      ok = false;
      continue;
    }
    const dutyKeys = new Set(job.highlights.map(norm));
    const dup = job.achievements.filter((a) => dutyKeys.has(norm(a)));
    if (dup.length) {
      console.warn(`⚠️  ${rel}：${job.name} 有 ${dup.length} 条成果与职责重复`);
    }
  }

  console.log(`✅ ${rel} 可用（${size} 字节，basics.name=${data.basics.name}）`);

  if (rel.includes(".en.")) checkEnglish(data, rel);
}

if (!ok) {
  console.error("");
  console.error("部署中止：简历 JSON 不可用。");
  console.error("请本地执行 `node scripts/local-build.js`（或依赖已有的上一版文件）并提交结果后重试。");
  console.error("若仅英文版缺失：执行 `node scripts/translate.js` 单独重译。");
  process.exit(1);
}
