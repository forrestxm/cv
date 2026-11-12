import { useEffect, useMemo, useState } from "react";
import resumeZh from "./resume.json";
import resumeEn from "./resume.en.json";
import { UI, detectLang, STORAGE_KEY } from "./i18n";
import "./style.css";

const GITHUB = "https://github.com/forrestxm";

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// 把 "2026-05" 渲染成本地化的年月：中文 2026.5 / 英文 May 2026
const formatMonth = (value, lang) => {
  const m = /^(\d{4})-(\d{1,2})$/.exec(String(value ?? "").trim());
  if (!m) return String(value ?? "");
  const year = m[1];
  const month = Number(m[2]);
  if (lang === "en") return `${MONTHS_EN[month - 1] ?? ""} ${year}`.trim();
  return `${year}.${month}`;
};

const dateRange = (job, lang) => {
  const start = formatMonth(job.startDate, lang);
  const end = job.endDate ? formatMonth(job.endDate, lang) : lang === "en" ? "Present" : "至今";
  if (start && end) return `${start} – ${end}`;
  return start || end;
};

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <div className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState(detectLang);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const t = UI[lang] ?? UI.zh;

  const data = useMemo(() => {
    const resume = lang === "en" ? resumeEn : resumeZh;
    return {
      basics: resume.basics ?? {},
      work: resume.work ?? [],
      skills: resume.skills ?? [],
      certificates: resume.certificates ?? [],
      languages: resume.languages ?? [],
      education: toArray(resume.education)
    };
  }, [lang]);

  const { basics, work, skills, certificates, languages, education } = data;

  // 语言切换：同步 <html lang>、标题、URL（可分享 ?lang=en）、本地记忆
  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.title = t.title;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
      const url = new URL(window.location.href);
      if (lang === "zh") url.searchParams.delete("lang");
      else url.searchParams.set("lang", lang);
      window.history.replaceState({}, "", url);
    } catch {
      /* 隐私模式忽略 */
    }
  }, [lang, t]);

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
      btn.textContent = t.contact.copied;
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = t.contact.copy;
        btn.classList.remove("done");
      }, 1600);
    });
  };

  const closeMenu = () => setMenuOpen(false);
  const toggleLang = () => setLang((prev) => (prev === "zh" ? "en" : "zh"));

  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>

      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a className="brand" href="#top" onClick={closeMenu}>
            {basics.name}
            <span className="brand-dot">.</span>
          </a>
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#about" onClick={closeMenu}>{t.nav.about}</a>
            <a href="#experience" onClick={closeMenu}>{t.nav.experience}</a>
            <a href="#skills" onClick={closeMenu}>{t.nav.skills}</a>
            <a href="#certificates" onClick={closeMenu}>{t.nav.certificates}</a>
            <a href="#education" onClick={closeMenu}>{t.nav.education}</a>
            <a href="#contact" onClick={closeMenu}>{t.nav.contact}</a>
            <button className="lang-toggle" onClick={toggleLang} title={t.switchTitle} aria-label={t.switchTitle}>
              {t.switchTo}
            </button>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>{t.nav.cta}</a>
          </nav>
          <button
            className={`nav-toggle ${menuOpen ? "open" : ""}`}
            aria-label={t.openMenu}
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
            <p className="hero-eyebrow reveal">{basics.label ?? ""}</p>
            <h1 className="hero-name reveal" style={{ transitionDelay: "80ms" }}>{basics.name}</h1>
            <p className="hero-tagline reveal" style={{ transitionDelay: "160ms" }}>
              {t.hero.tagline[0]}
              <br />
              {t.hero.tagline[1]}
            </p>
            <div className="hero-stats reveal" style={{ transitionDelay: "240ms" }}>
              {t.stats.map((s, i) => (
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
              <a className="btn btn-primary" href="#experience">{t.hero.primary}</a>
              <a className="btn btn-ghost" href="#contact">{t.hero.secondary}</a>
            </div>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span></span>
          </div>
        </section>

        {/* ===== 关于 ===== */}
        <section className="section" id="about">
          <div className="section-head">
            <p className="section-kicker reveal">{t.about.kicker}</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>{t.about.title}</h2>
          </div>
          <div className="about-grid">
            <div className="about-text">
              {basics.summary && (
                <Reveal>
                  <p>{basics.summary}</p>
                </Reveal>
              )}
              <Reveal delay={80}>
                <p>{t.about.extra}</p>
              </Reveal>
            </div>
            <div className="about-cards">
              {t.about.cards.map((c, i) => (
                <Reveal key={i} delay={120 + i * 80}>
                  <div className="mini-card">
                    <span className="mini-icon">{c.icon}</span>
                    <h3>{c.h}</h3>
                    <p>{c.p}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 经历 ===== */}
        <section className="section section-alt" id="experience">
          <div className="section-head">
            <p className="section-kicker reveal">{t.experience.kicker}</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>{t.experience.title}</h2>
          </div>
          <div className="timeline">
            {work.map((job, i) => (
              <div className="tl-item" key={i}>
                <Reveal delay={i * 60}>
                  <div className="tl-dot"></div>
                  <div className="tl-head">
                    <h3>{job.position}</h3>
                    <span className="tl-org">{job.name}</span>
                    <span className="tl-date">{dateRange(job, lang)}</span>
                  </div>
                  <div className="tl-body">
                    {job.summary && <p>{job.summary}</p>}
                    {job.highlights?.length > 0 && (
                      <div className="tl-block">
                        {job.achievements?.length > 0 && (
                          <p className="tl-block-title">{t.experience.duties}</p>
                        )}
                        <ul>
                          {job.highlights.map((h, j) => (
                            <li key={j}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {job.achievements?.length > 0 && (
                      <div className="tl-block tl-ach">
                        <p className="tl-block-title">{t.experience.achievements}</p>
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
            <p className="section-kicker reveal">{t.skills.kicker}</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>{t.skills.title}</h2>
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
              <p className="section-kicker reveal">{t.certificates.kicker}</p>
              <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>{t.certificates.title}</h2>
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
            <p className="section-kicker reveal">{t.education.kicker}</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>{t.education.title}</h2>
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
                <h3>{t.education.languages}</h3>
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
            <p className="section-kicker reveal">{t.contact.kicker}</p>
            <h2 className="section-title reveal" style={{ transitionDelay: "60ms" }}>{t.contact.title}</h2>
          </div>
          <div className="contact-grid">
            {basics.url && (
              <Reveal>
                <a className="contact-item" href={basics.url} target="_blank" rel="noreferrer">
                  <span className="contact-icon">🌐</span>
                  <div>
                    <span className="contact-label">{t.contact.url}</span>
                    <span className="contact-value">{basics.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  <button
                    className="copy-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      copy(basics.url, e);
                    }}
                    title={t.contact.copyTitle}
                  >
                    {t.contact.copy}
                  </button>
                </a>
              </Reveal>
            )}
            {basics.email && (
              <Reveal>
                <a className="contact-item" href={`mailto:${basics.email}`}>
                  <span className="contact-icon">✉️</span>
                  <div>
                    <span className="contact-label">{t.contact.email}</span>
                    <span className="contact-value">{basics.email}</span>
                  </div>
                  <button
                    className="copy-btn"
                    data-copy={basics.email}
                    onClick={(e) => {
                      e.preventDefault();
                      copy(basics.email, e);
                    }}
                    title={t.contact.copyTitle}
                  >
                    {t.contact.copy}
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
                  title={t.contact.copyTitle}
                >
                  {t.contact.copy}
                </button>
              </a>
            </Reveal>
          </div>
          <p className="contact-note reveal">{t.contact.note}</p>
        </section>
      </main>

      <footer className="footer">
        <p>{t.footer}</p>
      </footer>

      <a className={`back-top ${showTop ? "show" : ""}`} href="#top" aria-label={t.backTop}>
        ↑
      </a>
    </>
  );
}
