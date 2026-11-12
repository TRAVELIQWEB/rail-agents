# RailAgents typography implementation

Completed 12 November 2026. Local source changes only; no deployment performed.

## Audit

Reviewed all 33 `page.tsx` route files, shared layouts, UI components, font setup,
global stylesheet and four CSS modules before replacing typography. The initial
inventory covered 101 TSX/CSS files. Inter was already the shared font and remains
the only downloaded font family. No packages or font downloads were added.

Main inconsistencies were 8–13.5px helper/caption text, page titles ranging from
22px to 50px, arbitrary 650/750/850 weights, conflicting module/utility overrides,
and a separate blog heading/body scale. Multiple H1 source occurrences in PNR
and blog source were checked: loading/loaded branches and HTML normalization do
not render duplicate primary headings together.

Machine-readable inventories: `typography-audit-before.json` and
`typography-audit-after.json`. The audit can be repeated with:

```sh
node scripts/audit-typography.mjs docs/typography-audit-after.json
```

## Central system

`src/app/typography.css`, imported after `globals.css` in the root layout, owns
responsive sizes, line heights, heading weights and role classes. Breakpoints
are mobile below 640px, tablet 640–1023px, and desktop from 1024px.

| Role | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Display / homepage hero | 30px | 34px | 40px |
| Page title | 28px | 32px | 36px |
| H2 | 24px | 26px | 30px |
| H3 | 20px | 22px | 24px |
| H4 | 18px | 19px | 20px |
| H5 | 17px | 18px | 18px |
| H6 | 16px | 16px | 16px |
| Hero description | 16px | 17px | 18px |
| Article/guide introduction | 17px | 17px | 18px |
| Article body | 16px | 17px | 17px |
| Normal body | 16px | 16px | 16px |
| Card description / table | 14px | 14px | 14px |
| Helper | 13px | 13px | 13px |
| Caption / badge | 12px | 12px | 12px |
| Button | 15px | 15px | 15px |
| Input | 16px | 16px | 16px |
| Label | 14px | 14px | 14px |
| Compact calculator/status section | 22px | 22px | 24px |
| Result title | 18px | 18px | 18px |
| Main result value | 20px | 20px | 24px |
| Financial amount | 26px | 26px | 32px |
| Card title | 17px | 17px | 18px |
| Blog listing title | 18px | 18px | 20px |
| Navigation | 15px | 15px | 14px |
| Logo | 18px | 18px | 20px |

Token names use `--type-*`: display, page-title, h2 through h6,
hero-description, introduction, body-large, body, body-small, helper, caption,
label, button, input, table, card-title, article-title, article-h2, article-h3,
article-h4, article-body, section-compact, result-title, result, amount, logo,
navigation, and named line-height/colour tokens. Matching `type-*` classes apply
these roles to JSX. Visual roles do not change semantic heading elements.

Body and secondary text colours are #344054 and #667085. Brand backgrounds are
preserved. Normal-sized action labels on brand orange use navy for contrast.
Calculated contrast ratios: body on white 10.46:1, secondary on white 4.97:1,
navy on brand orange 4.75:1. These are palette checks, not a complete WCAG audit
of every dynamic state, image or third-party embed.

## Pages and components updated

Shared header, logo, mobile menu, footer, hero, section headings, cards, forms
and buttons now use named roles. Coverage includes home, tools, PNR, live train
status, all calculator families, blog listing/articles, guides, About, Contact,
Ask Nihal, videos, registration/rules/provider directories, refund guidance,
terms, and admin shell/forms/tables/login. Dynamic and alias routes receive
the same shared components. See `typography-changed-files.txt` for the full
source/style/test/documentation file list.

CSS modules now reference the centralized size tokens. A narrow-screen width
guard was added to the existing Tools selector after responsive testing found
it extending beyond a 320px viewport; its layout and functionality are retained.

## Preservation and exceptions

- No content, wording, URL, metadata, schema, calculator formula, API request,
  database structure, publishing operation or navigation handler was changed
  by this typography task. Existing working-tree changes were retained.
- Metadata definitions were compared against HEAD in all 80 changed TSX files;
  exported metadata and `generateMetadata` definitions are unchanged.
- Compact result/card/footer headings use explicit visual roles while retaining
  their semantic H2/H3 levels. This avoids making UI headings article-sized.
- Tables retain scrolling within their existing containers; 12px status badges
  and metadata are intentional exceptions to 14px table copy.
- Long-form content uses a 760px measure where possible. Articles with existing
  floated media keep their original containing width, so the adjacent text is
  not squeezed into a narrow column. This preserves the established media layout.
- Article paragraphs/headings receive reading spacing. Existing compact form,
  table, card and section-layout spacing is retained to avoid a page redesign.
- The rich editor's authored inline typography, code and existing print styles
  are retained. Admin UI controls receive the shared system; the editing canvas
  is not rewritten and saved content is not migrated.
- Some legacy utility names remain in admin/editor source and colour/state
  classes remain throughout. Explicit role classes own public typography;
  targeted `!important` font rules prevent legacy module sizes from winning.

## Executed validation

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed |
| `npx eslint .` | Passed with no errors or warnings |
| `npm run build` | Passed; 59 static pages generated |
| Metadata definition comparison | Passed, 80 changed TSX files |
| Chrome responsive DOM checks | Passed, 154 viewport/route combinations |
| Representative screenshot inspection | Tools mobile and article desktop inspected |

The initial sandboxed build could not download the existing Inter font. The
build was rerun with network permission and completed successfully.

Browser checks used the existing local development server and headless Chrome.
Widths: 320, 375, 640, 768, 1024, 1440, 2560px, with a 1000px viewport height.
Each checked route had one visible main H1, no detected page-level horizontal
overflow/uncontained content, and visible inputs at least 16px. The mobile Tools
selector overflow found in the first run was fixed and retested successfully.

Routes: home, tools, PNR, live status, fare calculator, refund calculator,
ticket-date calculator, chart-time calculator, blog listing, guides listing,
About, Contact, terms, Ask Nihal, videos, agent registration, agent rules, PSP
directory, mobile-number refund guide, a published blog article, a detailed
guide, and admin login. JSON results are in `typography-browser-results.json`;
representative captures are in `typography-preview/`.

To repeat:

```sh
node scripts/check-typography-browser.mjs
# Optional specific routes:
node scripts/check-typography-browser.mjs /tools /pnr-status
```

The browser checker requires local Chrome and defaults to localhost:3000;
`TYPOGRAPHY_TEST_URL` can select another local preview URL.

## Testing limits / remaining review

Authenticated admin routes were not browser-tested after login; their components
were typechecked, linted and included in the production build. Live provider
lookups, calculator transactions and publishing were not re-exercised as part
of this typography-only task. Representative article/guide pages were checked,
not every database-authored article or externally embedded document. Authored
inline formatting and third-party embeds can retain intentional typography
differences. Browser checks were run in Chrome, not Safari/Firefox or physical
mobile devices. Production output was built; responsive tests used local dev.
