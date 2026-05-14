import * as fs from "fs";
import * as path from "path";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)$/i;

/**
 * Копирует фото из корня репозитория `Apart photo/<N> …/` в `web/public/apartment-photos/<N>/`.
 * Номер папки (1–19) совпадает с полем photoFolder в seed.
 */
export function syncApartPhotoFolders(webRoot: string): { copied: number; skipped: string } {
  const candidates = ["Apart photo", "Apart photos"];
  let sourceRoot = "";
  for (const name of candidates) {
    const p = path.join(webRoot, "..", name);
    if (fs.existsSync(p)) {
      sourceRoot = p;
      break;
    }
  }

  if (!sourceRoot) {
    return {
      copied: 0,
      skipped: `Не найдена папка с фото рядом с web: «Apart photo» или «Apart photos» (${path.join(webRoot, "..")})`,
    };
  }

  let copied = 0;
  const destRoot = path.join(webRoot, "public", "apartment-photos");
  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const m = ent.name.match(/^(\d+)\s/);
    if (!m) continue;
    const id = m[1]!;
    const srcDir = path.join(sourceRoot, ent.name);
    const dstDir = path.join(destRoot, id);
    fs.mkdirSync(dstDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      if (!IMAGE_EXT.test(file)) continue;
      const from = path.join(srcDir, file);
      const to = path.join(dstDir, file);
      fs.copyFileSync(from, to);
      copied++;
    }
  }

  return { copied, skipped: "" };
}

export function listPublicPhotos(webRoot: string, folderNum: number): string[] {
  const dir = path.join(webRoot, "public", "apartment-photos", String(folderNum));
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort();
}

export function photoPublicPath(folderNum: number, filename: string): string {
  return `/apartment-photos/${folderNum}/${encodeURIComponent(filename)}`;
}
