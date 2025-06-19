const fs = require("fs");
const path = "CHANGELOG.md";
let text = fs.readFileSync(path, "utf8");

// 1. Turn "## 0.4.0" into "## v0.4.0 - YYYY.MM.DD"
const today = new Date().toISOString().split("T")[0].replace(/-/g, ".");
text = text.replace(
  /^##\s*(\d+\.\d+\.\d+)/m,
  (_, ver) => `## v${ver} - ${today}`,
);

fs.writeFileSync(path, text, "utf8");
