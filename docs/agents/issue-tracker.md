# Issue tracker: Local Markdown

Issues for this repo live as markdown files under `docs/`.

## Conventions

- The spec is `docs/specs/0001-modular-salon-platform.md`.
- Implementation tickets are one file per ticket at `docs/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file.
- `docs/index.md` is the map: the full ticket list with title and blocking edges, in dependency order. Read it first; it is loaded once per session, not re-derived from the issue files.
- Each ticket file carries near the top:
  - `**Blocked by:**` — the tickets (by number/title) that must complete first, or "None (can start immediately)".
  - `**Status:**` — the triage state. Every ticket currently reads `ready-for-agent` (see `triage` if that vocabulary is ever needed here).
- Comments and conversation history append to the bottom of the file under a `## Comments` heading.

## When a skill says "publish to the issue tracker"

Create a new file under `docs/issues/`, and add its row to `docs/index.md`.

## When a skill says "fetch the relevant ticket"

Read the file at `docs/issues/<NN>-<slug>.md`. The user will normally pass the number or path directly.

## Build status (used by `/orchestrate`)

The `orchestrate` skill drives tickets through implementation and review. It
tracks that separately from triage `Status:`, as a `**Build status:**` line it
adds directly beneath `**Status:**` the first time a ticket is claimed — absence
of the line means the ticket hasn't been claimed yet.

Values: `claimed` (an implementer is working it) → `in-review` (a verifier is
checking the branch) → `changes-requested` (verifier found something; back to
an implementer) → `done` (merged to `main`).

- **Frontier**: tickets in `docs/index.md` with no `**Build status:**` line yet, every ticket in their `Blocked by` at `done`.
- **Branch per ticket**: `ticket/<NN>-<slug>`, cut from `main`.
- **Claim**: add the `**Build status:** claimed` line before any work starts, so a second orchestrator run doesn't grab the same ticket.
- **Resolve**: on a clean verify and merge to `main`, set `**Build status:** done` and record the merge commit in a `## Build log` section appended to the ticket file.

## Related

- `docs/agents/orchestrate-notes.md` — if present, standing decisions the orchestrator has made about this run (worktree cleanup, escalations raised) that aren't per-ticket.
