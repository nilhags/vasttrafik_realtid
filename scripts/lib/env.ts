import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnv() {
  try {
    const text = readFileSync(resolve(import.meta.dirname, "..", "..", ".env"), "utf-8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {
    // .env is optional – vars may already be in the environment
  }
}
