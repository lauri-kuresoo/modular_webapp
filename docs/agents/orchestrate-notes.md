# Orchestrate run notes

Standing decisions for the current `/orchestrate` run. Per-ticket state lives in
each ticket's `**Build status:**` line and `## Build log`; this file is only for
decisions that span tickets.

## Integration branch

`main` is checked out in the primary worktree, so this run integrates on
`claude/task-orchestration-agents-868e53`, which was identical to `main` at
`debecff` when the run started. Nothing is pushed. Fast-forwarding real `main`
onto the integration branch is the user's call.

## Ticket worktrees are pre-made, not auto-isolated

Each ticket gets `.claude/worktrees/ticket-<NN>-<slug>` created by the
orchestrator with `git worktree add -b ticket/<NN>-<slug>`, and implementers are
spawned without `isolation: "worktree"`. Two reasons: the implementer hard-stops
unless its branch is exactly `ticket/<NN>-<slug>`, and a `changes-requested`
round has to reuse the same worktree to keep branch history linear.

## Implementers pre-check against the verifier's own criteria

Implementer prompts point at `.claude/agents/verifier.md` and ask the
implementer to self-check against it before reporting. The independent verifier
still runs afterwards — an implementer cannot review itself, and it has no
`Agent` tool to spawn one. This only lowers what the verifier finds.

## Agent models

Implementers and verifiers run on Opus. The `Agent` tool has no per-agent
reasoning-effort parameter, so effort is the harness default.

## Subagents carry their own standards; they do not call skills

`implementer` and `verifier` used to be told to call the `implement` and
`code-review` skills. Both instructions were dead: `implement` is configured
`disable-model-invocation` and refused every call, and neither agent has an
`Agent` tool, so `code-review` could not fan out into its parallel axes either.
Every implementer burned a turn discovering this.

Both definitions now carry their guidance inline and neither has the `Skill`
tool:

- **`implementer`** owns clean-code rules (naming, one-thing functions, comments
  that record *why*, no duplicated knowledge, no speculative generality, loud
  boundaries) and module shape (deep not wide, smallest public surface, one-way
  dependency direction, decisions placed where callers cannot forget them).
- **`verifier`** runs three separate axes — Spec, Standards-and-clean-code, and
  Quality gates — and re-runs the tooling itself rather than trusting reported
  results.

The two files are coupled on purpose: the verifier judges against the clean-code
rules written in `implementer.md`, so the implementer knows the bar and the
verifier applies the same one. Edit them together.

## The defect classes this project actually hits

The spec's Testing Decisions rules out automated tests and CI quality gates in
v1, on the strategy of *designing defect classes out* rather than detecting them,
plus the gates that come free with the build (`tsc` failing the deploy).

Four tickets in, the defects that have actually shipped are none of the classes
it designed out. All three share one shape — **a decision that looks correct and
silently never applies** — and all three are invisible to `tsc`, to lint, and to
review by eye:

| Class | Shipped on | Found by |
|---|---|---|
| Tailwind's scanner reads doc comments, emitting live CSS rules from prose | 02, 03 | manual built-CSS selector diff |
| A platform CSS rule placed in a cascade layer where it is outranked | 02 (twice) | one-off browser measurement |
| A build-time read cached for a year, surviving in `.next/cache` | 04 | manual seed-A/seed-B reproduction |

Each was found by a verifier re-deriving the check from scratch, which is most of
why verifications have run 15–90 minutes. Each was then recorded as
"known-outstanding" in a build log, with no owner and nothing preventing the next
occurrence — and the first class duly recurred on the very next ticket.

**What has been done about it:** `.claude/agents/verifier.md` now carries these as
standing invariants every verifier runs regardless of the ticket's subject, so
they are executed consistently rather than rediscovered. That makes detection
repeatable. It does not make it automatic.

**What has not been decided, and is the user's call, not the orchestrator's:**
whether the no-CI-gates position is still right now that the failure mode is
known. The spec's own logic points at designing these out rather than detecting
them — for instance scoping Tailwind's `@source` so prose cannot reach the
scanner at all, which removes the first class entirely rather than checking for
it. That is a spec amendment, not an orchestration decision.
