# dev-skills

38 skills for engineering, design, planning and writing, packaged so they work
in both Claude Cowork and Claude Code CLI without being tied to a single project.

## Contents

**Thinking and planning** — grill-me, grilling, grill-with-docs, wait-what,
research, to-spec, to-questionnaire, to-tickets, triage, wayfinder, loop-me

**Architecture and code** — improve-codebase-architecture, codebase-design,
domain-modeling, code-review, tdd, implement, implement-spec, prototype,
diagnosing-bugs, resolving-merge-conflicts, migrate-to-shoehorn,
setup-ts-deep-modules, setup-pre-commit, git-guardrails-claude-code

**Design** — apple-design

**Writing** — writing-for-agents, writing-shape, writing-beats,
writing-fragments, teach, scaffold-exercises

**Session management** — handoff, claude-handoff, retro, wizard, ask-matt,
setup-matt-pocock-skills

22 of the 38 set `disable-model-invocation: true`, meaning they only run when
you type the slash command. The other 16 can also trigger automatically when
their description matches what you are doing.

## Install

**Cowork / desktop** — accept the `dev-skills.plugin` file in chat.

**Claude Code CLI** — point the CLI at the marketplace directory that contains
this plugin, then install:

    /plugin marketplace add <path-to>/claude-plugins
    /plugin install dev-skills@lauri-local

## Provenance

Synced from `mattpocock/skills` and `emilkowalski/skills` via the tool that
maintains `skills-lock.json`. Re-running that sync updates the source
directory, not this plugin — rebuild the plugin afterwards to pick up changes.
