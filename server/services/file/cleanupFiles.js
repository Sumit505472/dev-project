import fs from "fs/promises";
import path from "path";
import { PATHS } from "../../config/path.js";

const safeDelete = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") console.error(err.message);
  }
};

const cleanupFiles = async ({
  language,
  sourceFilename,
  inputFilename,
  outputFilename,
}) => {
  await safeDelete(
    sourceFilename && path.join(PATHS.codes, sourceFilename)
  );

  await safeDelete(
    inputFilename && path.join(PATHS.inputs, inputFilename)
  );

  await safeDelete(
    outputFilename && path.join(PATHS.outputs, outputFilename)
  );

  if (language === "java") {
    await safeDelete(path.join(PATHS.codes, "Main.class"));
  }
};

export default cleanupFiles;
