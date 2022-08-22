import fs from "fs";

export const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'))