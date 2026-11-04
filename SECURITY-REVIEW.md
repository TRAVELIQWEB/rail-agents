# IRCTC Refund Calculator Security and Deployment Review

## Scope and result

Reviewed the IRCTC Cancellation & Refund Calculator backend migration, including
the public API, server-only calculation/workflow modules, active frontend
controller, production client chunks, validation tests, and production build.
No files were changed as part of the audit itself. This report was created at
the user's request.

## Findings

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🟡 MEDIUM | [route.ts](./src/app/api/irctc-cancellation-refund/route.ts) | 425 | The public POST endpoint has no shared production rate limit. Automated repeated requests could consume server resources; select an edge/provider limiter or distributed service for the actual hosting platform. | 9/10 |

No critical or high-severity vulnerabilities were identified.

## Security controls observed

- The API accepts POST only, requires `application/json`, limits streamed
  request bodies to 16 KiB, and rejects malformed JSON.
- New operation schemas are exact-key validated; raw input validation checks
  numeric values, enum values, passenger limits, fare/catering/insurance
  values, local date/time syntax, and IANA timezones.
- Unexpected calculation errors return a generic response rather than stack
  traces or implementation details.
- Responses set `Cache-Control: no-store` and
  `X-Content-Type-Options: nosniff`.
- Calculation internals and timing implementation identifiers were absent from
  production client chunks. `baseCancelCut` and the sleeper rule identifier
  occur as display/input data, not calculation source or formulas.
- The endpoint is intentionally public and does not rely on cookies or
  authentication. It has no state-changing side effect. Same-origin browser
  use does not require CORS configuration; cross-origin JSON browser requests
  are not enabled by a CORS response policy, and non-JSON form submissions are
  rejected by the content-type check.

## Deployment recommendations

- The hosting provider was not identifiable from the repository. Configure a
  provider/edge WAF or shared distributed rate limiter before public launch.
  Do not rely on the existing in-memory limiter: it is not suitable for
  distributed production traffic.
- No calculator-specific environment variables were required by this review.
- The production build includes `/api/irctc-cancellation-refund`.
- The existing Next.js middleware deprecation warning remains unrelated to
  this calculator migration.

## Verification

- TypeScript check: passed.
- Focused ESLint: passed.
- Backend tests: 27 passed, including all 25 comparison cases and 78 passenger
  combinations.
- Production API: 103 golden cases and 1,420 exact financial display-field
  comparisons passed. Malformed JSON, oversized payload, wrong content type,
  and GET requests returned 400, 413, 415, and 405 respectively.
- Production build: passed.
- Golden fixture and reference HTML SHA-256 hashes were unchanged:
  - `tests/fixtures/irctc-refund-baseline.json`:
    `ED30E0C7EFBA98034531E6D8E715D04DAAA61E3848611BFA70D4D540FC7797BC`
  - `reference_irctc_cancellation.html`:
    `EB0FC08AB3042A645A6B928CF2B49A565EF73E007A0102055560FED3D66996B8`
