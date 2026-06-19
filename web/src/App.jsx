import resume from "./resume.json";

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: "auto", fontFamily: "sans-serif" }}>
      <h1>{resume.basics?.name}</h1>
      <h3>{resume.basics?.label}</h3>

      <section>
        <h2>Experience</h2>
        {resume.work?.map((job, i) => (
          <div key={i}>
            <h3>{job.name}</h3>
            <p>{job.position}</p>
            <ul>
              {job.highlights?.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        <p>
          {resume.skills?.map(s => s.name).join(", ")}
        </p>
      </section>
    </div>
  );
}