import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function load(file, mocks = {}) {
  const sandbox = { exports: {}, URL, require(name) {
    if (name === "server-only") return {};
    if (!(name in mocks)) throw new Error(`Unexpected dependency: ${name}`);
    return mocks[name];
  } };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2017 } }).outputText, sandbox);
  return sandbox.exports;
}
const schema = load("src/models/global-variable.schema.ts");
const registry = load("src/lib/global-variable-registry.ts", { "@/models/global-variable.schema": schema });
const keys = schema.GlobalVariableKey;
const pairs = [[keys.YOUTUBE_URL, "youtube.com"], [keys.FACEBOOK_URL, "facebook.com"], [keys.INSTAGRAM_URL, "instagram.com"]];

test("social registry restricts URLs to each platform, HTTPS, and credential-free authorities", () => {
  for (const [key, domain] of pairs) {
    for (const value of ["", `https://${domain}/profile`, `https://www.${domain}/channel/profile`]) registry.validateGlobalVariableInput(key, value, "", true);
    for (const value of [`http://${domain}/profile`, `https://${domain}.evil.test/`, `https://evil.test/${domain}`, `https://user:pass@${domain}/`, `https://${domain}:8443/`, ` https://${domain}/`, "javascript:alert(1)"]) {
      assert.throws(() => registry.validateGlobalVariableInput(key, value, "", true));
    }
  }
});

function reader(records = [], fail = false) {
  const calls = [];
  const settings = load("src/lib/social-settings.ts", {
    "@/models/global-variable.schema": schema, "@/lib/global-variable-registry": registry,
    react: { cache: fn => fn },
    "next/cache": { unstable_cache(fn, cacheKeys, options) {
      assert.equal(cacheKeys[0], "global-social-links-v1"); assert.equal(options.revalidate, 60); assert.equal(options.tags[0], "social-links");
      return fn;
    } },
    "@/lib/global-variables": { SOCIAL_LINKS_CACHE_TAG: "social-links", async getGlobalVariables(requested) {
      calls.push([...requested]); if (fail) throw new Error("Unavailable");
      return Object.fromEntries(requested.map(key => [key, records.find(r => r.key === key && r.status)?.value ?? null]));
    } },
  });
  return { ...settings, calls };
}

test("social reader batch-fetches existing active values and hides missing/inactive/invalid records", async () => {
  const h = reader([{ key: keys.YOUTUBE_URL, value: "https://youtube.com/channel/example", status: true }, { key: keys.INSTAGRAM_URL, value: "https://instagram.com/example", status: false }, { key: keys.FACEBOOK_URL, value: "https://evil.test/profile", status: true }]);
  const links = await h.getSocialLinks();
  assert.equal(links.youtube, "https://youtube.com/channel/example"); assert.equal(links.instagram, null); assert.equal(links.facebook, null);
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0].length, 3);
  const allActive = reader(pairs.map(([key, domain]) => ({ key, value: `https://${domain}/example`, status: true })));
  const active = await allActive.getSocialLinks();
  assert.equal(active.youtube, "https://youtube.com/example");
  assert.equal(active.facebook, "https://facebook.com/example");
  assert.equal(active.instagram, "https://instagram.com/example");
  for (const source of [reader(), reader([], true)]) assert.ok(Object.values(await source.getSocialLinks()).every(v => v === null));
});

test("all public social consumers hide missing links and preserve configured anchor behavior", async () => {
  const jsx = (type, props) => ({ type, props });
  const icons = new Proxy({}, { get: (_, key) => key });
  const links = { youtube: "https://youtube.com/channel/example", instagram: null, facebook: null };
  const mocks = { "react/jsx-runtime": { jsx, jsxs: jsx }, "react-icons/fa6": icons, "lucide-react": icons, "next/image": { default: "img" }, "@/components/SocialLinksProvider": { useSocialLinks: () => links }, "@/config/tools": { railTools: [] }, "@/components/layout/Logo": { Logo: "logo" }, "@/components/ui/InternalLink": { InternalLink: "internal-link" } };
  const footer = load("src/components/layout/Footer.tsx", mocks);
  const cards = load("src/components/home/SocialCards.tsx", mocks);
  const query = load("src/components/ui/QueryPage.tsx", { ...mocks, "@/lib/social-settings": { getSocialLinks: async () => links }, "@/components/layout/Header": { Header: "header" }, "@/components/layout/Footer": footer, "@/components/ui/QueryForm": { QueryForm: "form" } });
  function anchors(node) {
    if (!node || typeof node !== "object") return [];
    return [...(node.type === "a" && /youtube|facebook|instagram/.test(node.props.href) ? [node.props] : []), ...[node.props?.children].flat(Infinity).flatMap(anchors)];
  }
  for (const component of [footer.Footer(), cards.SocialCards({ links }), await query.QueryPage({})]) {
    const found = anchors(component);
    assert.ok(found.length > 0);
    assert.ok(found.every(a => a.href === links.youtube && a.target === "_blank" && a.rel === "noopener noreferrer"));
  }
  links.youtube = null;
  assert.equal(anchors(footer.Footer()).length, 0);
  assert.equal(cards.SocialCards({ links }), null);
  assert.equal(anchors(await query.QueryPage({})).length, 0);
  for (const platform of ["youtube", "instagram", "facebook"]) {
    Object.assign(links, { youtube: null, instagram: null, facebook: null, [platform]: `https://${platform}.com/example` });
    for (const component of [footer.Footer(), cards.SocialCards({ links }), await query.QueryPage({})]) {
      const found = anchors(component);
      assert.ok(found.length > 0);
      assert.ok(found.every(a => a.href === links[platform]));
    }
  }
});
