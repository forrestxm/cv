// 把构建好的站点用无头 Chrome/Edge 打印成 PDF（中文 + 英文各一份）
// 用法：npm run pdf   或   node scripts/build-pdf.mjs
//
// 说明：
// 1. 只依赖本机已安装的 Chrome/Edge，不引入 puppeteer；
// 2. 用本地 http 服务托管 web/dist，避免 file:// 下 ES module 被 CORS 拦截；
// 3. 先输出到临时 ASCII 文件名，再改名，规避 Windows 上中文路径传参的编码问题。

import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { spawn } from "child_process";

const root = process.cwd();
const distDir = path.join(root, "web/dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon"
};

const TARGETS = [
  { lang: "zh", file: "夏铭-简历.pdf", web: "resume-zh.pdf", label: "中文版" },
  { lang: "en", file: "Forrest-Xia-Resume.pdf", web: "resume-en.pdf", label: "English" }
];

// 站点上的下载文件名用 ASCII，避免中文路径在 URL / GitHub Pages 上的编码问题；
// resumes/ 下仍保留便于直接投递的可读文件名。
const webPublicDir = path.join(root, "web/public/downloads");
const webDistDir = path.join(root, "web/dist/downloads");

function findBrowser() {
  const fromEnv = process.env.CHROME_PATH;
  const candidates = [
    fromEnv,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    // Linux（GitHub Actions 的 ubuntu runner 自带 Chrome/Chromium）
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/opt/google/chrome/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium"
  ].filter(Boolean);

  const found = candidates.find((p) => fs.existsSync(p));
  if (found) return found;

  // 再扫一遍 PATH，兼容 nvm/自定义安装位置
  const names = ["google-chrome", "google-chrome-stable", "chrome", "chromium", "chromium-browser", "msedge"];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    for (const name of names) {
      const candidate = path.join(dir, name);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

function serve(dir) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.join(dir, urlPath === "/" ? "index.html" : urlPath);
    if (!filePath.startsWith(dir)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(dir, "index.html");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

function printToPdf(browser, url, outFile) {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    "--virtual-time-budget=10000",
    "--run-all-compositor-stages-before-draw",
    `--print-to-pdf=${outFile}`,
    url
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(browser, args, { stdio: "ignore" });
    const timer = setTimeout(() => child.kill(), 90_000);
    child.on("error", reject);
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (fs.existsSync(outFile) && fs.statSync(outFile).size > 0) resolve();
      else reject(new Error(`打印失败（退出码 ${code}）：${url}`));
    });
  });
}

const browser = findBrowser();
if (!browser) {
  console.error("❌ 未找到 Chrome/Edge。请安装，或用 CHROME_PATH 指定可执行文件路径。");
  process.exit(1);
}

if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.error("❌ 找不到 web/dist/index.html，请先执行：cd web && npm run build");
  process.exit(1);
}

console.log(`🧭 浏览器：${browser}`);
const { server, port } = await serve(distDir);
console.log(`🌐 本地服务：http://127.0.0.1:${port}/`);

let failed = false;

try {
  for (const target of TARGETS) {
    const tmp = path.join(os.tmpdir(), `cv-resume-${target.lang}-${Date.now()}.pdf`);
    const url = `http://127.0.0.1:${port}/?lang=${target.lang}`;
    console.log(`🖨️  生成${target.label}：${url}`);

    try {
      await printToPdf(browser, url, tmp);
      const finalPath = path.join(root, "resumes", target.file);

      fs.mkdirSync(path.dirname(finalPath), { recursive: true });
      let written = finalPath;
      try {
        fs.copyFileSync(tmp, finalPath);
      } catch (err) {
        // 目标文件被 PDF 阅读器/浏览器占用时，退回到带后缀的文件名，不中断整批导出
        if (["EBUSY", "EPERM", "EACCES"].includes(err.code)) {
          const alt = finalPath.replace(/\.pdf$/i, `-${target.lang.toUpperCase()}.pdf`);
          fs.copyFileSync(tmp, alt);
          written = alt;
          console.warn(
            `   ⚠️  ${path.basename(finalPath)} 被占用（可能正在阅读器中打开），已改为 ${path.basename(alt)}`
          );
        } else {
          throw err;
        }
      }

      // 同步一份到站点目录，供在线简历页的「下载 PDF」按钮使用：
      // web/public 供本地开发/下次构建，web/dist 让本次产物立即可用
      const published = [];
      for (const dir of [webPublicDir, webDistDir]) {
        if (dir === webDistDir && !fs.existsSync(path.join(distDir, "index.html"))) continue;
        try {
          fs.mkdirSync(dir, { recursive: true });
          fs.copyFileSync(tmp, path.join(dir, target.web));
          published.push(path.relative(root, path.join(dir, target.web)));
        } catch (err) {
          console.warn(`   ⚠️  无法写入 ${path.relative(root, dir)}（${err.code || err.message}）`);
        }
      }

      fs.unlinkSync(tmp);
      const kb = (fs.statSync(written).size / 1024).toFixed(0);
      const pages = (fs.readFileSync(written).toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
      console.log(`   ✅ ${path.relative(root, written)}（${kb} KB，约 ${pages} 页）`);
      if (published.length) console.log(`      ↳ 站点下载：${published.join("、")}`);
    } catch (err) {
      failed = true;
      console.error(`   ❌ ${target.label}：${err.message}`);
    }
  }
} finally {
  server.close();
}

if (failed) process.exit(1);
console.log("✅ PDF 导出完成");
