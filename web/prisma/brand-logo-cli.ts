import path from "path";
import { fileURLToPath } from "url";
import { syncBrandLogo } from "./brand-logo-sync";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
if (syncBrandLogo(webRoot)) console.log("OK: public/brand/logo-mark.* (надпись в шапке — текстом)");
else console.warn("Папка «Логотип» / «логотип» не найдена или пуста.");
