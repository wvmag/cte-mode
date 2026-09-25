# cte-mode

omp plugin. `/cte` on. Agent talks simple. Like we both have CTE.

Short sentences. Small words. "X good. Y bad." `->` marks the thing to
watch: "Rollout finishes -> Good." No metaphors. No renaming. kubectl is
kubectl. Redis is Redis.

Facts stay facts. Numbers stay exact. Code stays code. Only the talking is dumb.

Josh Gillam made this bit popular. He explains fitness this way. Simple. Not mean.

## Commands

| Command | Effect |
|---|---|
| `/cte` | Toggle. On or off. Survives quit + resume. |
| `/cte on` / `/cte off` | Set it. |
| `/cte status` | Show state. |
| `/cte default on\|off` | New sessions start this way. File: `~/.config/cte-mode/default`. |
| `stop cte mode` / `normal mode` | Type this. Mode goes off. |

Status bar shows `● 🧠 CTE ON`. Then it is on.

## What changes

- Words. Only words. Code blocks, commands, file paths, error text: same as always.
- Info stays right. Voice is dumb. Facts are not.
- One session only. Default. `/cte default on` makes it sticky.

## Install

```bash
git clone https://github.com/wvmag/cte-mode
omp install ./cte-mode
```

## Files

- `extensions/cte-mode.js` — the toggle
- `skills/cte/SKILL.md` — the rules the agent gets

## Note

`omp -p "/cte on"` one-shot run does not save the toggle. Print mode. No session save. Interactive and `omp -c` resume work fine.

## License

MIT
