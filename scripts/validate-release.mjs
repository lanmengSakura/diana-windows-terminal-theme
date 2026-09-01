import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), "..");
const ignoredDirectories = new Set([".git", "node_modules", "dist", "out", "coverage"]);
const forbiddenDirectories = new Set(["state", "logs", "backups", "evidence", "probes"]);
const requiredFiles = ["README.md", "LICENSE", "ASSET_LICENSES.md", "SECURITY.md", "PRE_RELEASE.md"];
const textExtensions = new Set([".cmd", ".css", ".html", ".js", ".json", ".md", ".mjs", ".ps1", ".txt", ".ts"]);
const sensitivePatterns = [
  { name: "absolute user path", pattern: /[A-Z]:\\Users\\/i },
  { name: "local user name", pattern: /\u84dd\u68a6/ },
  { name: "Codex session path", pattern: /\.codex[\\/]sessions/i },
  {
    name: "debugging launch argument",
    pattern: /--remote-debugging-(?:address|port)/i,
    extensions: new Set([".cmd", ".js", ".json", ".mjs", ".ps1", ".ts"]),
  },
  { name: "credential assignment", pattern: /(?:api[_-]?key|access[_-]?token|cookie)\s*[:=]\s*["'][^"']{8,}/i },
];

const failures = [];
const files = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (forbiddenDirectories.has(entry.name)) failures.push(`forbidden directory: ${relativePath}`);
      visit(absolutePath);
      continue;
    }
    files.push({ absolutePath, relativePath, size: fs.statSync(absolutePath).size });
  }
}

for (const requiredFile of requiredFiles) {
  if (!fs.existsSync(path.join(root, requiredFile))) failures.push(`missing required file: ${requiredFile}`);
}

visit(root);

for (const file of files) {
  if (file.size > 10 * 1024 * 1024) failures.push(`file exceeds 10 MiB: ${file.relativePath}`);
  const extension = path.extname(file.relativePath).toLowerCase();
  if (!textExtensions.has(extension)) continue;
  const text = fs.readFileSync(file.absolutePath, "utf8");
  for (const check of sensitivePatterns) {
    if (check.extensions && !check.extensions.has(extension)) continue;
    if (check.pattern.test(text)) failures.push(`${check.name}: ${file.relativePath}`);
  }
  if (extension === ".json") {
    try {
      JSON.parse(text);
    } catch (error) {
      failures.push(`invalid JSON: ${file.relativePath}: ${error.message}`);
    }
  }
  if (extension === ".css") {
    for (const match of text.matchAll(/url\(([^)]+)\)/g)) {
      const reference = match[1].trim().replace(/^['"]|['"]$/g, "");
      if (!reference || /^(?:data:|https?:|file:|#|var\(|__)/i.test(reference)) continue;
      const cleanReference = reference.split(/[?#]/, 1)[0];
      const resolved = path.resolve(path.dirname(file.absolutePath), cleanReference);
      if (!fs.existsSync(resolved)) failures.push(`missing CSS asset: ${file.relativePath} -> ${reference}`);
    }
  }
}

const packagePath = path.join(root, "package.json");
if (fs.existsSync(packagePath)) {
  const manifest = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  if (manifest.license !== "MIT") failures.push("package.json license must be MIT");
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, files: files.length, bytes: files.reduce((sum, file) => sum + file.size, 0) }, null, 2));
