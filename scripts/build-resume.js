import { execSync } from "child_process";

console.log("🚀 Running resume agent...");

execSync("node agent/convert.js", { stdio: "inherit" });

console.log("📦 Copying to web...");

execSync("cp resumes/output.json web/src/resume.json");

console.log("✅ Build complete");