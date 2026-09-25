# cte-mode

Talk-like-we-both-have-CTE mode for omp. `/cte` makes the agent explain
everything in the simplest possible terms — short sentences, small words,
"X good. Y bad." — with no metaphors, no similes, no renaming: real names
stay real (kubectl is kubectl), while the facts, numbers, code, and
commands stay exact.

Format popularized by fitness creator Josh Gillam (@gillamfitness): useful
information in the simplest terms, without being condescending. Dumb voice,
never wrong facts.

## Commands

| Command | Effect |
|---|---|
| `/cte` | Toggle for this session (survives quit + resume) |
| `/cte on` / `/cte off` | Set explicitly |
| `/cte status` | Show session state + default |
| `/cte default on\|off` | New sessions start that way (`~/.config/cte-mode/default`) |
| `stop cte mode` / `normal mode` | Turn it off in plain language |

Status bar shows `● 🧠 CTE ON` while active.

## What it changes

- Prose only. Code blocks, commands, file paths, identifiers, error text: never translated.
- Real info, dumb words. The point still lands.
- Session-scoped by default; `/cte default on` opts into cross-session.

## Install

```bash
git clone https://github.com/wvmag/cte-mode
omp install ./cte-mode
```

`omp install` from a local path does not copy the files. It points omp at
that folder. The folder becomes the plugin's permanent home — clone it
somewhere you keep (not `/tmp`), and don't delete it later. Delete it and
omp's plugin silently dies, even though the install said "Linked ✔".

## Files

- `extensions/cte-mode.js` — the toggle (command, session state, rules injection)
- `skills/cte/SKILL.md` — the ruleset the model gets

## Notes

- A turnless `omp -p "/cte on"` one-shot doesn't persist the toggle (print
  mode never flushes session entries; same limitation ponytail has).
  Interactive use and `omp -c` resume work fully.

## License

MIT
