import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { mergeWithDefaults } from "../lib/cms/merge";

const contentPath = path.join(process.cwd(), "data", "site-content.json");

let partial = {};
try {
  partial = JSON.parse(readFileSync(contentPath, "utf-8"));
} catch {
  console.log("No existing site-content.json, using defaults.");
}

const merged = mergeWithDefaults(partial as Parameters<typeof mergeWithDefaults>[0]);
mkdirSync(path.dirname(contentPath), { recursive: true });
writeFileSync(contentPath, JSON.stringify(merged, null, 2), "utf-8");
console.log("Synced site-content.json with CMS defaults.");
