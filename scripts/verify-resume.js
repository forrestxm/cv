import fs from "fs";
import path from "path";

// 部署前校验：两个 JSON 必须存在、可解析、且结构可用
const root = process.cwd();
const targets = ["resumes/output.json", "web/src/resume.json"];

let ok = true;

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

  console.log(`✅ ${rel} 可用（${size} 字节，basics.name=${data.basics.name}）`);
}

if (!ok) {
  console.error("");
  console.error("部署中止：简历 JSON 不可用。");
  console.error("请本地执行 `node scripts/local-build.js`（或依赖已有的上一版文件）并提交结果后重试。");
  process.exit(1);
}
