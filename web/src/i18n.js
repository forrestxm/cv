// 页面框架文案（不包含简历数据，简历数据来自 resume.json / resume.en.json）
export const UI = {
  zh: {
    htmlLang: "zh-CN",
    title: "夏铭 - Resume",
    switchTo: "EN",
    switchTitle: "Switch to English",
    skip: "跳到主要内容",
    openMenu: "打开菜单",
    nav: {
      about: "关于",
      experience: "经历",
      skills: "技能",
      certificates: "证书",
      education: "教育",
      contact: "联系",
      cta: "联系我"
    },
    hero: {
      tagline: ["以身作则，化繁为简，协作共赢。", "25 年横跨软件全球化、中间件、企业社交、存储自动化与临床研究软件的研发与管理经验。"],
      primary: "查看经历",
      secondary: "联系我",
      download: "下载 PDF 简历",
      downloadTitle: "下载离线 PDF 版简历"
    },
    stats: [
      { num: "25+", unit: "年", label: "软件工程经验" },
      { num: "20+", unit: "年", label: "项目管理经验" },
      { num: "10+", unit: "年", label: "团队管理经验" },
      { num: "3", unit: "家", label: "IBM · Dell EMC · Xincere Med" }
    ],
    about: {
      kicker: "关于我",
      title: "About Me",
      extra:
        "长期主导复杂软件产品从需求、设计、开发、测试到交付的全生命周期，擅长跨部门资源整合与教练式团队管理，多次代表研发部门应对客户稽查与审计。",
      cards: [
        { icon: "🎯", h: "以身作则", p: "高度责任感和主动性，长期保持稳定高质量的产出" },
        { icon: "🧩", h: "化繁为简", p: "丰富的复杂问题处理经验，善于把大问题拆解成可执行的路径" },
        { icon: "🤝", h: "协作共赢", p: "教练式管理培养团队，推动跨团队协作共创" }
      ]
    },
    experience: { kicker: "职业经历", title: "Experience", duties: "主要职责", achievements: "主要成果" },
    skills: { kicker: "专业技能", title: "Skills" },
    certificates: { kicker: "认证与培训", title: "Certificates & Trainings" },
    education: { kicker: "教育背景", title: "Education", languages: "Languages" },
    contact: {
      kicker: "联系我",
      title: "Contact",
      url: "在线简历",
      email: "邮箱",
      pdf: "PDF 简历",
      pdfHint: "下载",
      copy: "复制",
      copied: "已复制",
      copyTitle: "复制",
      note: "期待与您交流研发管理、AI 赋能研发与质量体系建设"
    },
    footer: "© 2026 夏铭 · 资深软件开发经理",
    backTop: "回到顶部"
  },

  en: {
    htmlLang: "en",
    title: "Forrest Xia - Resume",
    switchTo: "中文",
    switchTitle: "切换到中文",
    skip: "Skip to main content",
    openMenu: "Open menu",
    nav: {
      about: "About",
      experience: "Experience",
      skills: "Skills",
      certificates: "Certificates",
      education: "Education",
      contact: "Contact",
      cta: "Get in Touch"
    },
    hero: {
      tagline: [
        "Lead by example. Simplify the complex. Win together.",
        "25 years of R&D and management across software globalization, middleware, enterprise social software, storage automation and clinical research software."
      ],
      primary: "View Experience",
      secondary: "Get in Touch",
      download: "Download PDF",
      downloadTitle: "Download the offline PDF resume"
    },
    stats: [
      { num: "25+", unit: "yrs", label: "Software engineering" },
      { num: "20+", unit: "yrs", label: "Project management" },
      { num: "10+", unit: "yrs", label: "Team management" },
      { num: "3", unit: "companies", label: "IBM · Dell EMC · Xincere Med" }
    ],
    about: {
      kicker: "About",
      title: "About Me",
      extra:
        "Owns complex software products end to end — requirements, design, development, testing and delivery. Strong in cross-functional resource integration and coaching-style team management; has repeatedly represented R&D in customer audits and inspections.",
      cards: [
        { icon: "🎯", h: "Lead by Example", p: "Strong ownership and initiative, delivering consistent high-quality output over the long run" },
        { icon: "🧩", h: "Simplify the Complex", p: "Extensive experience with complex problems, turning big challenges into executable paths" },
        { icon: "🤝", h: "Win Together", p: "Coaching-style management that grows people and drives cross-team collaboration" }
      ]
    },
    experience: { kicker: "Career", title: "Experience", duties: "Responsibilities", achievements: "Key Achievements" },
    skills: { kicker: "Expertise", title: "Skills" },
    certificates: { kicker: "Certifications", title: "Certificates & Trainings" },
    education: { kicker: "Education", title: "Education", languages: "Languages" },
    contact: {
      kicker: "Contact",
      title: "Get in Touch",
      url: "Online Resume",
      email: "Email",
      pdf: "PDF Resume",
      pdfHint: "Download",
      copy: "Copy",
      copied: "Copied",
      copyTitle: "Copy",
      note: "Happy to talk about R&D management, AI-enabled engineering and quality systems"
    },
    footer: "© 2026 Forrest Xia · Senior Software Development Manager",
    backTop: "Back to top"
  }
};

export const LANGS = ["zh", "en"];

export const STORAGE_KEY = "cv.lang";

// 语言优先级：URL ?lang= > localStorage > 默认中文
export function detectLang() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl && LANGS.includes(fromUrl)) return fromUrl;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.includes(saved)) return saved;
  } catch {
    /* SSR 或隐私模式下忽略 */
  }
  return "zh";
}
