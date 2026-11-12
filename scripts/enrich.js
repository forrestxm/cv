// 后处理：补齐 AI 生成过程中易丢失的固定内容，并保证隐私字段不上线
const LABEL = "资深软件开发经理";

const EXTRA_CERTS = [
  "AI Fundamentals",
  "Advanced Leadership Experience",
  "Leadership Imperative",
  "Secure development practices",
  "Inspirational Leadership Workshop",
  "Apache Geronimo PMC member",
  "IBM Enterprise Design Thinking",
  "Architecture Thinking",
  "Leadership in a Project Team Environment",
  "MBTI workshop",
  "Advanced Negotiation",
  "Business Acumen",
  "Complicated Problem Solving",
  "Software Development Life Cycle methodology and best practices",
  "Senior Software/Solution Technical Support",
  "Software Development Team Coach",
  "Enterprise Social Solutions Domain Knowledge",
  "AI in GxP"
];

const LEADERSHIP_SKILLS = {
  name: "Leadership & Management",
  level: "",
  keywords: [
    "软件开发团队管理",
    "项目管理",
    "跨部门协作",
    "教练式管理",
    "Agile Scrum",
    "产品优先级协调",
    "研发质量体系建设"
  ]
};

const LANGUAGES = [
  { language: "Chinese", fluency: "Native" },
  { language: "English", fluency: "Professional" }
];

// 规范化工作经历：职责(highlights) 与 成果(achievements) 必须是两个独立数组
// 这里是兜底，真正的拆分责任在 agent/prompt.js，模型若仍混装则在此去重并告警
const norm = (s) => String(s ?? "").replace(/\s+/g, "").replace(/[，。；、,.;:：]/g, "");

function normalizeWork(work) {
  let changed = false;
  for (const job of work) {
    if (!Array.isArray(job.highlights)) {
      job.highlights = [];
      changed = true;
    }
    if (!Array.isArray(job.achievements)) {
      job.achievements = [];
      changed = true;
    }

    // 同一事实不允许同时出现在职责和成果里：以职责为准，从成果中移除重复项
    const dutyKeys = new Set(job.highlights.map(norm));
    const before = job.achievements.length;
    job.achievements = job.achievements.filter((a) => !dutyKeys.has(norm(a)));
    if (job.achievements.length !== before) {
      console.warn(
        `⚠️  ${job.name}：职责/成果中有 ${before - job.achievements.length} 条重复，已从成果中移除`
      );
      changed = true;
    }

    // 成果里出现"负责…"这类范围性描述，说明模型没拆分干净，提示人工确认
    const suspicious = job.achievements.filter((a) => /^(负责|参与|对接|协助|配合)/.test(String(a).trim()));
    if (suspicious.length) {
      console.warn(`⚠️  ${job.name}：成果中有 ${suspicious.length} 条疑似职责描述，请检查 prompt 输出`);
    }
    if (job.highlights.length && !job.achievements.length) {
      console.warn(`ℹ️  ${job.name}：无成果条目（achievements 为空），简历将只展示职责`);
    }
  }

  // 在职状态兜底：最新一段经历若被填成"当月结束"，页面上会显示成已离职。
  // 源文档写「至今」时模型偶尔会把当前年月填进 endDate，这里按"仍在职"处理并告警。
  const first = work[0];
  if (first && typeof first.endDate === "string") {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (first.endDate === current) {
      console.warn(
        `⚠️  ${first.name}：endDate 被填成当前月份（${current}），按"至今"处理并清空；若确已离职请在 input.md 写明具体结束年月`
      );
      first.endDate = "";
      changed = true;
    }
  }

  return changed;
}

export function enrichResume(json) {
  let changed = false;

  if (!json.basics) json.basics = {};
  // 模型偶发用 headline 替代 label，统一归一化为 label（Reactive Resume 字段名）
  if (!json.basics.label && json.basics.headline) {
    json.basics.label = json.basics.headline;
    changed = true;
  }
  if (json.basics.headline) {
    delete json.basics.headline;
    changed = true;
  }
  if (!json.basics.label) {
    json.basics.label = LABEL;
    changed = true;
  }
  // 隐私保护：任何情况下都不发布手机号
  if (json.basics.phone) {
    delete json.basics.phone;
    changed = true;
  }

  if (!Array.isArray(json.certificates)) json.certificates = [];
  const have = new Set(json.certificates.map((c) => c.name));
  for (const name of EXTRA_CERTS) {
    if (!have.has(name)) {
      json.certificates.push({ name, issuer: "" });
      changed = true;
    }
  }

  if (!Array.isArray(json.skills)) json.skills = [];
  if (!json.skills.some((s) => s?.name === "Leadership & Management")) {
    json.skills.unshift({
      name: LEADERSHIP_SKILLS.name,
      level: "",
      keywords: [...LEADERSHIP_SKILLS.keywords]
    });
    changed = true;
  }

  if (!Array.isArray(json.languages) || json.languages.length === 0) {
    json.languages = LANGUAGES.map((l) => ({ ...l }));
    changed = true;
  }

  if (json.education && !Array.isArray(json.education)) {
    if (!json.education.degree && json.education.studyType) {
      json.education.degree = json.education.studyType;
      changed = true;
    }
  }

  if (Array.isArray(json.work)) {
    if (normalizeWork(json.work)) changed = true;
  } else {
    json.work = [];
    changed = true;
  }

  return changed;
}
