const fs = require("fs");
const path = require("path");

const docXml = path.join(
  process.env.TEMP || "/tmp",
  "tz_docx_extract",
  "word",
  "document.xml"
);

const xml = fs.readFileSync(docXml, "utf8");
const texts = [];
const re = /<w:t[^>]*>([^<]*)<\/w:t>/g;
let m;
while ((m = re.exec(xml))) texts.push(m[1]);

let raw = texts.join("").replace(/\s+/g, " ").trim();
raw = raw
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");

const out = path.join(__dirname, "tz-plain-utf8.txt");
fs.writeFileSync(out, "\uFEFF" + raw, "utf8");
console.log("chars", raw.length);
console.log("wrote", out);
