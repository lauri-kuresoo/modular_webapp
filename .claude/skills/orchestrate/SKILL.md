---
name: orchestrate
description: "Drive the ticket graph in docs/index.md to completion by delegating to implementer and verifier subagents, merging each verified ticket to main. Use when the user wants tickets built rather than planned."
disable-model-invocation: true
---

# Orchestrate

You are the orchestrator. You hold the ticket graph, dispatch **implementer**
subagents to build tickets and **verifier** subagents to independently check
them, and merge what passes into `main`. Neither subagent talks to the other
directly or touches `main` — every handoff and every merge passes through you.

This is the direct-to-`main`, two-role sibling of `/implement-spec`. Reach for
`/implement-spec` instead when the work needs a PR (an external reviewer, a
host repo where `main` is protected); reach for this when it doesn't.

Read `docs/agents/issue-tracker.md` once per session for the tracker
conventions (ticket location, the `Blocked by` / `Status` / `Build status`
lines, the frontier and claim rules) before doing anything else below.

## Preconditions

Confirm before dispatching anything:

- Working tree is clean and on `main` (`git status --short`, `git branch --show-current`). If not, stop and ask — don't stash or discard on the user's behalf.
- `docs/index.md` and `docs/issues/*.md` exist and parse: every row has a title, a link, and a `Blocked by` list you can resolve to other rows.

## The loop

1. **Load the map.** Read `docs/index.md`. For each ticket, read only its `**Blocked by:**`, `**Status:**` and (if present) `**Build status:**` lines from `docs/issues/<NN>-<slug>.md` — not the full body yet.

2. **Compute the frontier.** A ticket is takable when every ticket in its `Blocked by` list has `Build status: done`, and it has no `Build status` line itself (unclaimed). If `docs/index.md` says two tickets are genuinely parallel, both belong in the frontier at once.

3. **Claim and dispatch.** For every frontier ticket, in one message so they run concurrently:
   - Add `**Build status:** claimed` to the ticket file and commit that alone to `main` (`chore(tickets): claim NN`) — this is what stops a second orchestrator run from double-dispatching it.
   - Create its branch: `git branch ticket/<NN>-<slug> main`.
   - Spawn an `implementer` subagent (`subagent_type: "implementer"`, `isolation: "worktree"`, `run_in_background: true`) with a prompt that is a **context pointer, not a restatement**: the ticket number, the ticket file path, the spec path, and "read `docs/agents/issue-tracker.md` for conventions." Do not paste the ticket body into the prompt — the implementer reads it.

4. **On an implementer's completion notification:**
   - Read its report. Note the branch and final commit SHA.
   - Spawn a `verifier` subagent (`subagent_type: "verifier"`, no isolation — it works from your own checkout via `git diff`/`git log` against the branch, it doesn't need its own worktree) with: the ticket file path, the branch name, and the fixed point (`main`, or `git merge-base main <branch>` if `main` moved since the branch was cut). Run it synchronously (`run_in_background: false`) — verification is quick and you need its verdict before deciding what's next.

5. **On `VERDICT: CLEAN`:**
   - Merge: `git merge --no-ff ticket/<NN>-<slug> -m "Merge ticket NN: <title>"`.
   - If the merge conflicts, do **not** resolve it yourself ad hoc — call the Skill tool with `resolving-merge-conflicts`. If that leaves anything ambiguous (both branches made a real, conflicting decision rather than a mechanical clash), stop and ask the user; don't pick a side silently.
   - Set `**Build status:** done` on the ticket, append a `## Build log` entry (branch, final SHA, merge commit, verifier's one-line summary), commit that to `main`.
   - Remove the implementer's worktree (`git worktree remove`) now that its branch is merged. Delete the branch too once merged, unless the user has asked to keep ticket branches around.
   - Recompute the frontier (step 2) — this merge may have unblocked new tickets. Dispatch them (step 3).

6. **On `VERDICT: CHANGES REQUESTED`:**
   - Set `**Build status:** changes-requested` on the ticket.
   - Spawn a fresh `implementer` in the **same worktree/branch** (do not create a new worktree — reuse the one from step 3, so its git history stays linear), with the verifier's report appended to its prompt as a context pointer to the ticket plus "a verifier found the following; resolve or explain: <verdict + findings>."
   - Loop back to step 4 with the new commit.
   - **Cap at two fix rounds per ticket.** If a third verify still isn't clean, stop dispatching on that ticket, leave its `Build status` at `changes-requested`, and surface it to the user with the verifier's last report rather than looping again. Keep working other frontier tickets while this one waits.

7. **Repeat** steps 2–6 until the frontier is empty and no ticket is `claimed`, `in-review` or `changes-requested`. Report the final state: tickets merged this run, their commits, and anything left escalated.

## Rules

- **Never push.** All merges land on your local `main`. Pushing to `origin` is the user's call — tell them what's ready to push, don't run it.
- **Never touch `main` except the two commit kinds above**: claiming a ticket, and merging/logging a finished one. All real work happens on ticket branches.
- **One escalation, not a pile.** When you stop dispatching on a ticket per the fix-round cap, say so once, plainly, with the specific unresolved finding — don't bury it in a wall of per-ticket status.
- **Respect user-named scope.** If the user invoked this for one ticket or a named subset, treat only those (and their blockers, if unmet) as the graph — don't run the whole backlog unasked.
- **A running orchestrator survives context limits.** Because state lives in the ticket files (`Build status`) and in git (branches, merge commits) rather than in your own memory, a fresh session can resume this loop from step 1 with no other handoff needed.
