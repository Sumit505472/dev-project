import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server root directory
export const ROOT_DIR = path.join(__dirname, "..");

export const PATHS = {
  codes: path.join(ROOT_DIR, "codes"),
  inputs: path.join(ROOT_DIR, "inputs"),
  outputs: path.join(ROOT_DIR, "execute", "outputs"),
};
