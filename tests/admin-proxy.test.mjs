import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { sealData, unsealData } from "iron-session";
import { NextRequest, NextResponse } from "next/server.js";

const password = "isolated-regression-secret-at-least-32-characters";
const sessionOptions = { password, cookieName: "railagents_admin_session", cookieOptions: { httpOnly: true, sameSite: "strict", secure: true } };
const validator = { exports: {}, process: { env: { ADMIN_EMAIL: "smoke@example.test" } }, require: () => ({}) };
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/admin-session-validation.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, validator);

function harness(preview = false) {
  const sandbox = {
    exports: {}, URL,
    process: { env: { ADMIN_SECRET_PATH: "/private-entry" } },
    require(name) {
      if (name === "next/server") return { NextResponse };
      if (name === "iron-session") return { unsealData };
      if (name === "@/lib/auth") return { sessionOptions, isAdminUiPreviewEnabled: () => preview };
      if (name === "@/lib/admin-session-validation") return validator.exports;
      throw new Error(`Unexpected import: ${name}`);
    },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/proxy.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, sandbox);
  return async (pathname, cookie) => sandbox.exports.proxy(new NextRequest(`https://example.test${pathname}`, {
    headers: cookie === undefined ? {} : { cookie: `${sessionOptions.cookieName}=${cookie}` },
  }));
}

test("invalid, expired and wrong-admin cookies reach login once and are cleared", async () => {
  const proxy = harness();
  const expired = await sealData({ admin: { isLoggedIn: true, email: "smoke@example.test" } }, { password, ttl: -120 });
  const wrongAdmin = await sealData({ admin: { isLoggedIn: true, email: "other@example.test" } }, { password });
  const wrongKey = await sealData({ admin: { isLoggedIn: true, email: "smoke@example.test" } }, { password: "different-regression-secret-with-32-characters" });
  for (const cookie of ["invalid-cookie", expired, wrongAdmin, wrongKey, ""]) {
    const protectedPage = await proxy("/admin/whatsapp", cookie);
    assert.equal(protectedPage.headers.get("location"), "https://example.test/admin/login");
    assert.match(protectedPage.headers.get("set-cookie"), /Max-Age=0/i);
    const login = await proxy("/admin/login", cookie);
    assert.equal(login.status, 200);
    assert.equal(login.headers.get("location"), null);
    assert.match(login.headers.get("set-cookie"), /Max-Age=0/i);
  }
});

test("valid sessions preserve dashboard redirects, protected pages and private entry", async () => {
  const proxy = harness();
  const cookie = await sealData({ admin: { isLoggedIn: true, email: "smoke@example.test", sessionVersion: 1 } }, { password });
  assert.equal((await proxy("/admin/login", cookie)).headers.get("location"), "https://example.test/admin/dashboard");
  assert.equal((await proxy("/admin", cookie)).headers.get("location"), "https://example.test/admin/dashboard");
  assert.equal((await proxy("/private-entry", cookie)).headers.get("location"), "https://example.test/admin/dashboard");
  assert.equal((await proxy("/admin/whatsapp", cookie)).status, 200);
  assert.equal((await proxy("/admin/whatsapp", cookie)).headers.get("set-cookie"), null);
});

test("anonymous sessions are denied; public pages and development preview retain behavior", async () => {
  const proxy = harness();
  assert.equal((await proxy("/admin/whatsapp")).headers.get("location"), "https://example.test/admin/login");
  assert.equal((await proxy("/admin/login")).status, 200);
  assert.equal((await proxy("/about", "bad-cookie")).status, 200);
  assert.equal((await harness(true)("/admin/whatsapp")).status, 200);
});
