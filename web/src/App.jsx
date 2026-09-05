import resume from "./resume.json";

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

const h2Style = {
  borderBottom: "1px solid #bbb",
  paddingBottom: 4,
  fontSize: 20,
  marginTop: 28,
};

const dateRange = (job) => {
  const s = job.startDate ?? "";
  const e = job.endDate ?? "";
  if (s && e) return `${s} – ${e}`;
  return s || e;
};

export default function App() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "auto",
        fontFamily: "sans-serif",
        color: "#222",
        lineHeight: 1.55,
        padding: "24px 16px 60px",
      }}
    >
      <header>
        <h1 style={{ margin: 0 }}>{basics.name}</h1>
        {basics.label && (
          <h3 style={{ margin: "6px 0 0", fontWeight: 500 }}>{basics.label}</h3>
        )}
        {(basics.email || basics.phone) && (
          <p style={{ margin: "8px 0 0" }}>
            {basics.email && <span>📧 {basics.email}</span>}
            {basics.email && basics.phone && <span>　|　</span>}
            {basics.phone && <span>📱 {basics.phone}</span>}
          </p>
        )}
        {basics.summary && (
          <p style={{ margin: "10px 0 0" }}>{basics.summary}</p>
        )}
      </header>

      <section>
        <h2 style={h2Style}>Experience</h2>
        {work.map((job, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "14px 0 2px" }}>{job.name}</h3>
            <p style={{ margin: 0, fontWeight: 600 }}>{job.position}</p>
            {dateRange(job) && (
              <p style={{ margin: "2px 0 0", color: "#555" }}>
                {dateRange(job)}
              </p>
            )}
            {job.summary && <p style={{ margin: "6px 0 0" }}>{job.summary}</p>}
            {job.highlights?.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 22 }}>
                {job.highlights.map((h, j) => (
                  <li key={j} style={{ marginBottom: 4 }}>
                    {h}
                  </li>
                ))}
              </ul>
            )}
            {job.achievements?.length > 0 && (
              <>
                <p style={{ margin: "10px 0 0", fontWeight: 600 }}>
                  Achievements
                </p>
                <ul style={{ margin: "6px 0 0", paddingLeft: 22 }}>
                  {job.achievements.map((a, j) => (
                    <li key={j} style={{ marginBottom: 4 }}>
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </section>

      <section>
        <h2 style={h2Style}>Skills</h2>
        {skills.map((s, i) => (
          <p key={i} style={{ margin: "6px 0" }}>
            <strong>{s.name}</strong>
            {s.keywords?.length > 0 && (
              <span>: {s.keywords.join(", ")}</span>
            )}
          </p>
        ))}
      </section>

      {education.length > 0 && (
        <section>
          <h2 style={h2Style}>Education</h2>
          {education.map((e, i) => (
            <p key={i} style={{ margin: "6px 0" }}>
              <strong>{e.institution}</strong>
              {e.area && <span> — {e.area}</span>}
              {e.degree && <span> ({e.degree})</span>}
            </p>
          ))}
        </section>
      )}

      {certificates.length > 0 && (
        <section>
          <h2 style={h2Style}>Certificates & Trainings</h2>
          <ul style={{ margin: "8px 0 0", paddingLeft: 22, columnCount: 2, columnGap: 40 }}>
            {certificates.map((c, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {c.name}
                {c.issuer ? ` — ${c.issuer}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {languages.length > 0 && (
        <section>
          <h2 style={h2Style}>Languages</h2>
          <p style={{ margin: "6px 0" }}>
            {languages
              .map((l) => `${l.language} (${l.fluency})`)
              .join(", ")}
          </p>
        </section>
      )}
    </div>
  );
}
