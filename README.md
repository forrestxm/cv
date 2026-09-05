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
