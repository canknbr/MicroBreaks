# 20 Kod Denetim Promptu (AI-Coded Projeler İçin)

Kaynak: [@ersinkoc — X thread, 7 Temmuz 2026](https://x.com/ersinkoc/status/2074552091826413695)

> AI projenizi kodladı. "Her şey çalışıyor" dediniz. Dil fark etmez, agent'ına ver ve en az bir tur döndür.

---

## 1. Injection & Untrusted Input Sweep

Trace every point where external data (user input, HTTP params, headers, files, queue messages, third-party API responses, environment values) enters the system. Follow each value to its sinks: queries, shell/exec, file paths, templates, HTML output, redirects, deserializers, eval-like constructs. Flag every path where data reaches a sink without validation or context-appropriate encoding, and name the missing defense. Report per entry point, including entry points that are clean.

## 2. Authentication & Session Handling

Audit only how identity is established and maintained. Check: endpoints reachable without authentication that shouldn't be; token/session generation (entropy, expiry, rotation); credential storage and comparison (hashing algorithm, constant-time checks); logout and invalidation actually revoking access; password reset and account recovery flows; remember-me and refresh-token handling. For each mechanism, state what you verified vs. what depends on framework behavior you cannot see.

## 3. Authorization & IDOR Sweep

Assume authentication works; audit only WHO may do WHAT. For every operation that touches a resource owned by a user/tenant/org: is ownership or role verified server-side, before the action, on every path (including bulk, batch, export, and admin variants)? Flag any object ID accepted from the client and used without an ownership check (IDOR). Flag privilege checks done client-side, after the effect, or only on the happy path. List every endpoint/operation you inspected with its verdict.

## 4. Secrets & Sensitive Data Exposure

Hunt for: hardcoded credentials, API keys, tokens in code/config/tests/fixtures; secrets in log statements or error messages; PII written to logs; verbose error responses leaking stack traces, queries, or internal paths; sensitive fields returned in API responses that callers don't need; debug endpoints or flags. Check configs and example/env files, not just source. Report every hit with exact location and the exposure path (who can see it).

## 5. Error Handling & Failure Paths

For every multi-step operation, ask: what happens when step N fails after steps 1..N-1 succeeded? Hunt for: empty or swallow-all catch blocks; errors logged and then execution continuing in a corrupt state; partial writes with no rollback or compensation; error types collapsed so callers cannot distinguish retryable from fatal; failure paths that leak resources or hold locks. Report the concrete corrupt state each gap can produce.

## 6. Concurrency & Race Conditions

Within this runtime's concurrency model, hunt for: shared mutable state accessed without synchronization; check-then-act races (exists-then-create, read-then-update, balance-then-deduct); non-atomic read-modify-write on shared stores; missing awaits / fire-and-forget with side effects; lazy initialization unsafe under concurrent first access; lock ordering that can deadlock. For each finding, describe the interleaving that triggers it in one or two sentences. If the runtime makes a category impossible, say so and move on.

## 7. Resource Lifecycle & Leaks

Audit acquisition and release of every scarce resource: DB connections, file handles, sockets, subprocesses, timers/intervals, event listeners, temp files, locks. For each: is release guaranteed on ALL paths including exceptions and early returns (finally/defer/RAII/using equivalents)? Are pools bounded and returns guaranteed? Are listeners/timers removed when their owner is destroyed? Flag every acquisition whose release you cannot prove from the shown code.

## 8. Data Access Patterns & N+1

Audit how the code talks to its data stores. Hunt for: queries inside loops (N+1); missing batching where the API supports it; unbounded queries (no limit/pagination) on tables that grow; SELECT-everything where few fields are used; filtering/sorting/joining in application memory that the store should do; repeated identical reads within one request with no caching; write patterns causing lock contention. Where schema/indexes are not visible, tag index-related findings NEEDS-CONTEXT and name what you need.

## 9. Algorithmic Complexity & Hot Paths

Identify the paths most frequently executed or handling the largest data (request handlers, loops over collections, serialization). For each, state the load model you assume ("N items per request, M concurrent"), then flag: nested iteration over unbounded data, linear scans inside loops (accidental O(n²)), repeated recomputation of invariants, redundant serialization/parsing round-trips. Every finding must state the scale at which it starts to hurt; patterns that never see scale are NITs.

## 10. Memory & Unbounded Growth

Hunt for state that only grows: caches without eviction or TTL; collections appended to per-request at module/global scope; unbounded queues/buffers; loading entire datasets or files into memory to process a fraction; large object graphs retained by closures, listeners, or static references; per-user/per-session state never cleaned up. For each, state the growth driver (per request? per user? per day?) and the eventual failure mode.

## 11. External Calls, Timeouts & Resilience

List every call that leaves the process (HTTP, DB, cache, queue, third-party SDKs). For each, verify: an explicit timeout exists (flag every infinite-default); failure is handled distinctly from success-with-bad-data; retries, if any, are bounded with backoff and only on idempotent operations; one slow dependency cannot exhaust the caller's threads/connections/event loop; user-facing behavior on dependency failure is defined, not accidental. Output a table: call site → timeout → retry policy → failure behavior.

## 12. Idempotency & Retry Safety

Assume every operation can be delivered twice (client retry, queue redelivery, double click, network replay). For each state-changing operation: what happens on duplicate execution? Hunt for: payments/emails/notifications sent twice; counters double-incremented; duplicate rows on retried creates; non-idempotent handlers consumed from at-least-once queues; missing idempotency keys on unsafe endpoints that clients retry. Classify each operation: naturally idempotent / protected by key or constraint / UNSAFE.

## 13. Transaction & Consistency Boundaries

Find every operation that updates more than one thing (multiple rows/tables, DB + cache, DB + external service, DB + event publish). For each: is there a transaction, saga, outbox, or compensation strategy or does partial failure leave the system inconsistent? Specifically hunt for: cache updated before/without the DB commit; events published for changes that then roll back; cross-service writes with no reconciliation. Name the exact inconsistent state each gap produces and who observes it.

## 14. Configuration & Environment Hardening

Audit configuration across environments: dangerous defaults (debug mode, permissive CORS, disabled TLS verification, open admin ports); prod/dev config divergence that changes security behavior; config values trusted without validation at startup; feature flags that disable security controls; identical secrets/keys across environments; missing fail-fast when required config is absent (silently running misconfigured). Report per config file/source, including which environments you could not inspect.

## 15. Dependency & Supply Chain Review

From manifests and lockfiles: flag dependencies that are unused (declared but never imported), duplicated across the tree in conflicting versions, abandoned or archived upstream, or pulled in for one trivial function. Check for install-time script execution and typosquat-suspicious names. Identify which dependencies sit on security-critical paths (auth, crypto, parsing untrusted input) — these deserve version pinning and priority updates. You cannot query CVE feeds live: mark version-vulnerability claims NEEDS-CONTEXT with the exact package@version to check.

## 16. Logging, Observability & Auditability

Evaluate whether production failures can be diagnosed from the outside. Check: errors logged with enough context (correlation/request ID, relevant IDs but no PII/secrets, cross-check with pass 4); log levels meaningful (not everything ERROR or everything INFO); security-relevant events (login failures, permission denials, admin actions) leaving an audit trail; silent failure points with no signal at all; noisy logs in tight loops. Output: the top diagnostic blind spots — incidents that would be impossible to reconstruct.

## 17. API Contract Consistency

Audit the API surface (external or internal) as a consumer would: naming and casing consistency across endpoints; error response shape uniform and machine-parseable; status codes/error types used consistently (same failure → same code everywhere); pagination, filtering, and sorting conventions uniform; nullable vs. absent fields deliberate and consistent; breaking-change risks (fields renamed/removed, semantics changed) versus any versioning policy. Report inconsistencies in pairs: "endpoint A does X, endpoint B does Y for the same concept."

## 18. Cross-Module Contracts & Emergent Risks

Ignore single-file defects; audit interactions. For each module boundary you can see both sides of, reconstruct the implicit contract: who validates, who authorizes, who retries, who owns the transaction, which invariants each side assumes. Then hunt mismatches: responsibility gaps (each side assumes the other does it), double effects (both retry/cache/encode), invariant drift, failure-mode mismatch (one throws, the other expects codes), ordering coupling, fan-out amplification. Every finding names BOTH sides with locations. Start with a COVERAGE list: boundaries seen end-to-end vs. one side only — one-sided boundaries yield NEEDS-CONTEXT items, never conclusions.

## 19. Test Gap & Assertion Quality

Map existing tests against risk, not coverage percentage. Identify: critical paths (auth, money, data mutation, the findings of previous passes) with no failing-path tests; tests asserting implementation details instead of behavior (break on rename, survive real bugs); tests with no meaningful assertions (run-without-error only); shared mutable fixtures causing order dependence; concurrency- and boundary-value blind spots. Output a ranked list: the ten missing tests that would catch the most damage, each with the exact scenario to assert.

## 20. Verification & False-Positive Filter (her zaman en son çalıştır)

Input: all findings from previous passes plus the code. For each finding: locate the citation — mismatch means REJECTED unless you can relocate it; attempt to falsify it — an existing guard, validation, type constraint, or framework behavior that already prevents the problem means REJECTED with the disproving location cited; findings that depend on unseen code remain UNVERIFIED with the exact files needed. Merge duplicates across passes, keep the best writeup. Re-score severity conservatively: CRITICAL only if you can articulate the concrete failure yourself. You may not add new findings. Output three sections: CONFIRMED (sorted by severity), UNVERIFIED (with required context), REJECTED (with one-line reasons).
