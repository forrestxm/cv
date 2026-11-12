# cv
Host my latest resume

# AI Resume Pages

Convert Markdown resume → AI-optimized Reactive Resume → GitHub Pages site

## Bilingual (中文 / English)

The site ships both languages from a single Chinese source:

| file | language | produced by |
|---|---|---|
| `resumes/input.md` | 中文源 | 手工维护 |
| `resumes/output.json` + `web/src/resume.json` | 中文数据 | `local-build.js`（DeepSeek 结构化） |
| `resumes/output.en.json` + `web/src/resume.en.json` | 英文数据 | `translate.js`（DeepSeek 翻译中文 JSON） |

- 默认中文，导航栏右侧 `EN / 中文` 按钮切换；`?lang=en` 可直接打开英文版并记住选择
- 页面框架文案（导航、区块标题、按钮、页脚）在 `web/src/i18n.js`，不经过 AI
- 只重译英文版：`node scripts/translate.js`（读 `resumes/output.json`，不动中文）
- 翻译失败不阻塞部署：`local-build.js` 只告警，仓库中已有的英文 JSON 继续使用
- 结构校验：`translate.js` 会对比中英文 JSON 的键集合、数组长度、职责/成果条数，任何偏差都拒绝写入

## Auto-publish

The site publishes automatically whenever `resumes/input.md` changes on `main`:

1. Edit `resumes/input.md` (locally or directly on GitHub)
2. Push to `main`
3. GitHub Actions will:
   - Convert Markdown → JSON (DeepSeek, see `scripts/local-build.js`)
   - Apply enrichment patch (`scripts/enrich.js`): restore fixed content and strip private fields such as phone number
   - Translate the JSON to English (`scripts/translate.js`) and write the `*.en.json` pair
   - Commit the generated `resumes/output.json`, `resumes/output.en.json` and the two `web/src/*.json` back to the repo
   - Build the React site (`web/`)
   - Print the bilingual PDFs with headless Chrome and commit them (`scripts/build-pdf.mjs`)
   - Deploy to GitHub Pages (`gh-pages` branch)

## Work item schema: 职责 vs 成果

Each `work` entry carries two separate arrays so the site can render them as two blocks:

| field | meaning | wording |
|---|---|---|
| `highlights` | 职责 — what the person is responsible for | 负责…/主导…/对接…/代表… |
| `achievements` | 成果 — verifiable outcomes | 获批/通过/升级至/修复 N 个/落地/交付 |

The split is enforced in three places:

1. `agent/prompt.js` — the conversion rules the model must follow (main mechanism).
2. `scripts/enrich.js` — 兜底：保证两个数组存在、从 `achievements` 中移除与 `highlights` 重复的条目，并在控制台告警。
3. `scripts/verify-resume.js` — 部署前校验：缺少数组结构即中止部署，出现重复条目则告警。

`web/src/App.jsx` renders `highlights` under 「主要职责」 and `achievements` under
「主要成果」. 一段经历没有成果信息时，`achievements` 写成 `[]`，页面上会自动隐藏成果区块。

## 离线 PDF

`resumes/` 下保存中英文两份 PDF，用于线下投递：

| 文件 | 内容 | 站点下载地址 |
|---|---|---|
| `resumes/夏铭-简历.pdf` | 中文版 | `downloads/resume-zh.pdf` |
| `resumes/Forrest-Xia-Resume.pdf` | 英文版 | `downloads/resume-en.pdf` |

```bash
cd web && npm run build && cd ..
npm run pdf        # 或 node scripts/build-pdf.mjs
```

- 用本机 Chrome/Edge 的无头模式打印，不额外安装 puppeteer；可用 `CHROME_PATH` 指定浏览器
- 打印版式由 `web/src/style.css` 末尾的 `@media print` 控制：浅色、A4、13mm 页边距、分栏紧凑，与网页深色主题互不影响
- 生成逻辑会自建本地 http 服务托管 `web/dist`，避免 `file://` 下 ES module 被 CORS 拦截
- 目标文件被 PDF 阅读器占用时会自动回退为 `*-EN.pdf` 并给出提示
- 每次导出会同时复制一份到 `web/public/downloads/`（站点源）和 `web/dist/downloads/`（当前产物）：
  站点上的文件名用 ASCII（`resume-zh.pdf` / `resume-en.pdf`）避免中文路径编码问题，
  下载时通过 `<a download>` 还原为可读文件名

### 站点上的下载入口

- Hero 区第三个按钮「下载 PDF 简历」/ `Download PDF`
- 联系区的「PDF 简历」一行（与邮箱、GitHub 并列）
- 两处都跟随当前语言切换；打印时自动隐藏（`.hero-actions`、`.pdf-download` 在 `@media print` 中被隐藏）

### CI 中的 PDF

PDF 现在随部署一起自动更新（`Generate resume PDFs` 步骤）：

1. `npm run build` 之后用 runner 自带的 Chrome 打印中英文两份 PDF
2. 失败只告警不阻塞：`continue-on-error`，站点沿用上一次提交的 PDF
3. 成功后由 `git-auto-commit-action` 回写 `resumes/*.pdf` 与 `web/public/downloads/*.pdf`
4. `deploy.yml` 的 `paths` 已排除这两类文件，自动提交不会再次触发工作流

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
