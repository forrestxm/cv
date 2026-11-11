# cv
Host my latest resume

# AI Resume Pages

Convert Markdown resume → AI-optimized Reactive Resume → GitHub Pages site

## Auto-publish

The site publishes automatically whenever `resumes/input.md` changes on `main`:

1. Edit `resumes/input.md` (locally or directly on GitHub)
2. Push to `main`
3. GitHub Actions will:
   - Convert Markdown → JSON (DeepSeek, see `scripts/local-build.js`)
   - Apply enrichment patch (`scripts/enrich.js`): restore fixed content and strip private fields such as phone number
   - Commit the generated `resumes/output.json` and `web/src/resume.json` back to the repo
   - Build the React site (`web/`)
   - Deploy to GitHub Pages (`gh-pages` branch)

## Required secret

- `DEEPSEEK_API_KEY` — DeepSeek API key used by the resume builder.
  Add it in GitHub repo Settings → Secrets and variables → Actions.

  Must be a **Repository secret** named exactly `DEEPSEEK_API_KEY` (case-sensitive).
  An Environment secret only works if the job declares the same `environment:`; a
  *variable* (Settings → Variables) is NOT readable via `secrets.*`.

> Local runs and CI are independent: a local Windows/macOS user environment
> variable does **not** reach GitHub Actions. If the AI step fails in CI with
> `DEEPSEEK_API_KEY is missing`, the repo secret has not been created yet.

### Behaviour when the secret is missing or the AI call fails

Deployment is no longer blocked. The workflow:

1. runs a preflight check that reports whether the secret is present (never printing it);
2. skips `Generate resume JSON` and warns in the job summary if it is absent;
3. falls back to the JSON already committed at `resumes/output.json` / `web/src/resume.json`;
4. validates that JSON (`scripts/verify-resume.js`) and only then builds + deploys.

So the site is always deployed, but content may lag behind `input.md` until the
secret is configured. After adding the secret, trigger a refresh with
**Actions → Deploy Resume Site → Run workflow** (`workflow_dispatch`), which forces
a regeneration without needing an `input.md` edit.

## Manual local build

```bash
npm install
# Windows:
set DEEPSEEK_API_KEY=sk-xxx
node scripts/local-build.js
```

This regenerates `resumes/output.json` and `web/src/resume.json` locally.

## Output

https://forrestxm.github.io/cv
