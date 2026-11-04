import { extname, resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      shortCircuit: true,
      url: pathToFileURL(
        resolvePath(
          process.cwd(),
          "node_modules",
          "next",
          "dist",
          "compiled",
          "server-only",
          "empty.js",
        ),
      ).href,
    };
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!specifier.startsWith(".") || extname(specifier)) throw error;
    for (const extension of [".ts", ".tsx", ".js"]) {
      try {
        return await nextResolve(`${specifier}${extension}`, context);
      } catch {
        continue;
      }
    }
    throw error;
  }
}
