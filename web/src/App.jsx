import { useEffect, useState } from "react";
import resume from "./resume.json";
import "./style.css";

const basics = resume.basics ?? {};
const work = resume.work ?? [];
const skills = resume.skills ?? [];
const certificates = resume.certificates ?? [];
const languages = resume.languages ?? [];
const education = Array.isArray(resume.education)
  ? resume.education
  : resume.education
    ? [resume.education]
    : [];

const GITHUB = "https://github.com/forrestxm";

const stats = [
  { num: "25+", unit: "年", label: "软件工程经验" },
  { num: "20+", unit: "年", label: "项目管理经验" },
  { num: "10+", unit: "年", label: "团队管理经验" },
  { num: "3", unit: "家", label: "IBM · Dell EMC · Xincere Med" },
];

const dateRange = (job) => {
  const s = job.startDate ?? "";
  const e = job.endDate ?? "";
  if (s && e) return `${s} – ${e}`;
  return s || e;
};

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <div className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const copy = (text, e) => {
    const btn = e.currentTarget;
    navigator.clipboard?.writeText(text).then(() => {
      btn.textContent = "已复制";
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = "复制";
        btn.classList.remove("done");
      }, 1600);
    });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>

      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a className="brand" href="#top" onClick={closeMenu}>
            夏铭<span className="brand-dot">.</span>
          </a>
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#about" onClick={closeMenu}>关于</a>
            <a href="#experience" onClick={closeMenu}>经历</a>
            <a href="#skills" onClick={closeMenu}>技能</a>
            <a href="#certificates" onClick={closeMenu}>证书</a>
            <a href="#education" onClick={closeMenu}>教育</a>
            <a href="#contact" onClick={closeMenu}>联系</a>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>联系我</a>
          </nav>
          <button
            className={`nav-toggle ${menuOpen ? "open" : ""}`}
            aria-label="打开菜单"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main id="main">
        {/* ===== Hero ===== */}
        <section className="hero" id="top">
          <div className="hero-bg" aria-hidden="true"></div>
          <div className="hero-inner">
            <p className="hero-eyebrow reveal">{basics.label ?? "资深软件开发经理"}</p>
            <h1 className="hero-name reveal" style={{ transitionDelay: "80ms" }}>{basics.name}</h1>
            <p className="hero-tagline reveal" style={{ transitionDelay: "160ms" }}>
              以身作则，化繁为简，协作共赢。
              <br />
              25 年横跨软件全球化、中间件、企业社交、存储自动化与临床研究软件的研发与管理经验。
            </p>
            <div className="hero-stats reveal" style={{ transitionDelay: "240ms" }}>
              {stats.map((s, i) => (
                <div className="stat" key={i}>
                  <span className="stat-num">
                    {s.num}
                    <em>{s.unit}</em>
                  </span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="hero-actions reveal" style={{ transitionDelay: "320ms" }}>
              <a className="btn btn-primary" href="#experience">查看经历</a>
              <a className="btn btn-ghost" href="#contact">联系我</a>
            </div>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span></span>
          </div>
        </section>

        {/* ===== 关于 ===== */}
        <section className="section" id="about">
          <div className="section-head">
            <p className="section-kicker reveal">关于我</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>About Me</h2>
          </div>
          <div className="about-grid">
            <div className="about-text">
              {basics.summary && (
                <Reveal>
                  <p>{basics.summary}</p>
                </Reveal>
              )}
              <Reveal delay={80}>
                <p>
                  长期主导复杂软件产品从需求、设计、开发、测试到交付的全生命周期，
                  擅长跨部门资源整合与教练式团队管理，多次代表研发部门应对客户稽查与审计。
                </p>
              </Reveal>
            </div>
            <div className="about-cards">
              <Reveal delay={120}>
                <div className="mini-card">
                  <span className="mini-icon">🎯</span>
                  <h3>以身作则</h3>
                  <p>高度责任感和主动性，长期保持稳定高质量的产出</p>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="mini-card">
                  <span className="mini-icon">🧩</span>
                  <h3>化繁为简</h3>
                  <p>丰富的复杂问题处理经验，善于把大问题拆解成可执行的路径</p>
                </div>
              </Reveal>
              <Reveal delay={280}>
                <div className="mini-card">
                  <span className="mini-icon">🤝</span>
                  <h3>协作共赢</h3>
                  <p>教练式管理培养团队，推动跨团队协作共创</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===== 经历 ===== */}
        <section className="section section-alt" id="experience">
          <div className="section-head">
            <p className="section-kicker reveal">职业经历</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>Experience</h2>
          </div>
          <div className="timeline">
            {work.map((job, i) => (
              <div className="tl-item" key={i}>
                <Reveal delay={i * 60}>
                  <div className="tl-dot"></div>
                  <div className="tl-head">
                    <h3>{job.position}</h3>
                    <span className="tl-org">{job.name}</span>
                    <span className="tl-date">{dateRange(job)}</span>
                  </div>
                  <div className="tl-body">
                    {job.summary && <p>{job.summary}</p>}
                    {job.highlights?.length > 0 && (
                      <ul>
                        {job.highlights.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    )}
                    {job.achievements?.length > 0 && (
                      <div className="tl-ach">
                        <p className="tl-ach-title">主要成果</p>
                        <ul>
                          {job.achievements.map((a, j) => (
                            <li key={j}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 技能 ===== */}
        <section className="section" id="skills">
          <div className="section-head">
            <p className="section-kicker reveal">专业技能</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>Skills</h2>
          </div>
          <div className="skills-grid">
            {skills.map((s, i) => (
              <Reveal key={i} delay={(i % 2) * 80}>
                <article className="skill-card">
                  <div className="skill-top">
                    <span className="skill-num">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{s.name}</h3>
                  </div>
                  {s.keywords?.length > 0 && (
                    <div className="chips">
                      {s.keywords.map((k, j) => (
                        <span key={j}>{k}</span>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== 证书 ===== */}
        {certificates.length > 0 && (
          <section className="section section-alt" id="certificates">
            <div className="section-head">
              <p className="section-kicker reveal">认证与培训</p>
              <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>Certificates & Trainings</h2>
            </div>
            <Reveal>
              <div className="cert-panel">
                <div className="chips">
                  {certificates.map((c, i) => (
                    <span key={i}>
                      {c.name}
                      {c.issuer ? ` · ${c.issuer}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* ===== 教育 ===== */}
        <section className="section" id="education">
          <div className="section-head">
            <p className="section-kicker reveal">教育背景</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>Education</h2>
          </div>
          <div className="edu-wrap">
            <Reveal>
              <div className="edu-card">
                <h3>{education[0]?.institution}</h3>
                <p className="edu-school">{education[0]?.area}</p>
                <p>{education[0]?.degree || education[0]?.studyType}</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="edu-card lang-card">
                <h3>Languages</h3>
                <div className="lang-row">
                  {languages.map((l, i) => (
                    <span key={i}>
                      {l.language} · {l.fluency}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===== 联系 ===== */}
        <section className="section section-contact" id="contact">
          <div className="section-head">
            <p className="section-kicker reveal">联系我</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>Contact</h2>
          </div>
          <div className="contact-grid">
            {basics.url && (
              <Reveal>
                <a className="contact-item" href={basics.url} target="_blank" rel="noreferrer">
                  <span className="contact-icon">🌐</span>
                  <div>
                    <span className="contact-label">在线简历</span>
                    <span className="contact-value">{basics.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  <button
                    className="copy-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      copy(basics.url, e);
                    }}
                    title="复制"
                  >
                    复制
                  </button>
                </a>
              </Reveal>
            )}
            {basics.email && (
              <Reveal>
                <a className="contact-item" href={`mailto:${basics.email}`}>
                  <span className="contact-icon">✉️</span>
                  <div>
                    <span className="contact-label">邮箱</span>
                    <span className="contact-value">{basics.email}</span>
                  </div>
                  <button
                    className="copy-btn"
                    data-copy={basics.email}
                    onClick={(e) => {
                      e.preventDefault();
                      copy(basics.email, e);
                    }}
                    title="复制"
                  >
                    复制
                  </button>
                </a>
              </Reveal>
            )}
            <Reveal delay={80}>
              <a className="contact-item" href={GITHUB} target="_blank" rel="noreferrer">
                <span className="contact-icon">🐙</span>
                <div>
                  <span className="contact-label">GitHub</span>
                  <span className="contact-value">github.com/forrestxm</span>
                </div>
                <button
                  className="copy-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    copy(GITHUB, e);
                  }}
                  title="复制"
                >
                  复制
                </button>
              </a>
            </Reveal>
          </div>
          <p className="contact-note reveal">期待与您交流研发管理、AI 赋能研发与质量体系建设</p>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 夏铭 · 资深软件开发经理</p>
      </footer>

      <a className={`back-top ${showTop ? "show" : ""}`} href="#top" aria-label="回到顶部">
        ↑
      </a>
    </>
  );
}
