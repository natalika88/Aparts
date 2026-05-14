import path from "path";
import { fileURLToPath } from "url";
import { syncApartPhotoFolders } from "./photo-sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const r = syncApartPhotoFolders(webRoot);
if (r.skipped) console.warn(r.skipped);
else console.log(`Скопировано файлов: ${r.copied} → web/public/apartment-photos/`);
