import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { NextRequest } from "next/server.js";

const sandbox = { exports: {}, URL, require: name => { if (name === "server-only") return {}; throw new Error(name); } };
vm.runInNewContext(ts.transpileModule(readFileSync("src/lib/same-origin.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, sandbox);
const { isSameOriginRequest } = sandbox.exports;
const request = (url, origin, headers = {}) => new NextRequest(url, { headers: { ...(origin === null ? {} : { origin }), ...headers } });

test("normalized NextRequest URLs accept each exact incoming loopback Host", () => {
  for (const host of ["127.0.0.1:3159", "localhost:3159", "[::1]:3159"]) {
    const req = request(`http://${host}/api/admin/global-variables`, `http://${host}`, { host });
    assert.equal(isSameOriginRequest(req), true, host);
  }
});

test("loopback aliases, different ports and schemes remain distinct origins", () => {
  for (const origin of ["http://localhost:3159", "http://127.0.0.1:3160", "https://127.0.0.1:3159", "http://[::1]:3159"]) {
    assert.equal(isSameOriginRequest(request("http://127.0.0.1:3159/api/admin/global-variables", origin, { host: "127.0.0.1:3159" })), false);
  }
});

test("production hosts require exact origins and ignore forged forwarding headers", () => {
  assert.equal(isSameOriginRequest(request("https://railagents.in/api/admin/global-variables", "https://railagents.in", { host: "railagents.in" })), true);
  for (const origin of ["https://evil.test", "https://sub.railagents.in", "https://railagents.in.evil.test", "http://railagents.in", "https://railagents.in:444"]) {
    assert.equal(isSameOriginRequest(request("https://railagents.in/api/admin/global-variables", origin, { host: "railagents.in", "x-forwarded-host": "evil.test", forwarded: "host=evil.test" })), false);
  }
  assert.equal(isSameOriginRequest(request("http://railagents.in/api/admin/global-variables", "https://railagents.in", { host: "railagents.in", "x-forwarded-proto": "https" })), false);
});

test("missing, malformed and non-origin URL values fail closed", () => {
  for (const origin of [null, "null", "garbage", "https://railagents.in/path", "https://railagents.in/", "https://user:pass@railagents.in", "https://railagents.in?x", "https://railagents.in#x", "https://railagents.in,https://evil.test"]) {
    assert.equal(isSameOriginRequest(request("https://railagents.in/api/admin/global-variables", origin, { host: "railagents.in" })), false);
  }
  for (const host of ["evil.test@railagents.in", "railagents.in/path", "railagents.in,evil.test", "railagents.in:invalid"]) {
    assert.equal(isSameOriginRequest(request("https://railagents.in/api/admin/global-variables", "https://railagents.in", { host })), false);
  }
});
