import fs from "fs";
import path from "path";

export function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

export function listFolder(folderPath) {
  return fs.readdirSync(folderPath);
}
