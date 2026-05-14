import * as fs from "fs";
import * as path from "path";

const LOGO_FOLDERS = ["Логотип", "логотип", "Logotip", "Logo"];
const IMAGE_EXT = /\.(jpe?g|png|gif|svg|webp)$/i;

function listLogoImages(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, "ru"));
}

const byWordmarkName = (f: string) =>
  /wordmark|надпис|text|typo|title|логотип[_-]?2|^2[._-]/i.test(f);
const byMarkName = (f: string) =>
  /(^mark\.|logo-mark|silhouet|silhouette|icon|силуэт|логотип[_-]?1|^1[._-])/i.test(f);

/** Один файл силуэта: явное имя или первый файл, не похожий на «надпись». */
function pickMarkFile(files: string[]): string | undefined {
  const hinted = files.find(byMarkName);
  if (hinted) return hinted;
  const candidates = files.filter((f) => !byWordmarkName(f));
  const pool = candidates.length > 0 ? candidates : files;
  return pool[0];
}

/** Копирует только силуэт → `logo-mark.*` и `logo.*`. Надпись на сайте — текстом. */
export function syncBrandLogo(webRoot: string): boolean {
  const destDir = path.join(webRoot, "public", "brand");
  for (const name of LOGO_FOLDERS) {
    const dir = path.join(webRoot, "..", name);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    const files = listLogoImages(dir);
    if (files.length === 0) continue;

    const mark = pickMarkFile(files);
    if (!mark) continue;

    fs.mkdirSync(destDir, { recursive: true });
    for (const f of fs.existsSync(destDir) ? fs.readdirSync(destDir) : []) {
      if (/^logo/i.test(f) && IMAGE_EXT.test(f)) {
        fs.unlinkSync(path.join(destDir, f));
      }
    }

    const markExt = path.extname(mark).toLowerCase() || ".png";
    fs.copyFileSync(path.join(dir, mark), path.join(destDir, `logo-mark${markExt}`));
    fs.copyFileSync(path.join(dir, mark), path.join(destDir, `logo${markExt}`));

    return true;
  }
  return false;
}
