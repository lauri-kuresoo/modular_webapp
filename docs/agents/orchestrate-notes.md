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
