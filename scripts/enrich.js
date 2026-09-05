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

export function enrichResume(json) {
  let changed = false;

  if (!json.basics) json.basics = {};
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

  if (!json.skills.some((s) => s.name === "Leadership & Management")) {
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

  return changed;
}
