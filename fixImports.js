// fix-imports.js
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");

function processFile(filePath) {
  let code = fs.readFileSync(filePath, "utf8");
  let changed = false;

  code = code.replace(/from ['"](\.\.\/.*)['"]/g, (match, relPath) => {
    const absPath = path.resolve(path.dirname(filePath), relPath);
    if (absPath.startsWith(SRC_DIR)) {
      const newPath = absPath.replace(SRC_DIR + path.sep, "").replace(/\\/g, "/");
      changed = true;
      return `from '${newPath}'`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, code, "utf8");
    console.log(`Updated imports in: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (/\.(jsx?|tsx?)$/.test(file)) {
      processFile(fullPath);
    }
  });
}

walk(SRC_DIR);
console.log("✅ Import paths fixed to use absolute imports");
