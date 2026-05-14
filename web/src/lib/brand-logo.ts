import fs from "fs";
import path from "path";

/** Публичный URL файла силуэта после `syncBrandLogo` (`logo-mark.*` или старый `logo.*`). */
export function getBrandLogoMarkUrl(): string | null {
  const dir = path.join(process.cwd(), "public", "brand");
  if (!fs.existsSync(dir)) return null;

  const mark = fs.readdirSync(dir).find((x) => /^logo-mark\./i.test(x));
  if (mark) return `/brand/${encodeURIComponent(mark)}`;

  const legacy = fs.readdirSync(dir).find((x) => /^logo\./i.test(x));
  return legacy ? `/brand/${encodeURIComponent(legacy)}` : null;
}

/** @deprecated используйте getBrandLogoMarkUrl */
export function getBrandLogoPublicUrl(): string | null {
  return getBrandLogoMarkUrl();
}
