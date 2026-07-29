import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const serviceWorkerUrl = new URL("../apps/web/public/sw.js", import.meta.url);
const serviceWorkerPath = fileURLToPath(serviceWorkerUrl);

let serviceWorker;

try {
    const fileStats = await stat(serviceWorkerUrl);

    if (!fileStats.isFile() || fileStats.size === 0) {
        throw new Error("the generated file is empty");
    }

    serviceWorker = await readFile(serviceWorkerUrl, "utf8");
} catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`PWA verification failed: ${serviceWorkerPath} is unavailable (${reason}).`);
    process.exit(1);
}

if (serviceWorker.includes("self.__SW_MANIFEST")) {
    console.error("PWA verification failed: the precache manifest was not injected into sw.js.");
    process.exit(1);
}

if (!serviceWorker.includes("/offline")) {
    console.error("PWA verification failed: sw.js does not include the offline fallback.");
    process.exit(1);
}

console.log(`PWA verification passed: sw.js is ready (${serviceWorker.length} bytes).`);
