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
- No words born in this chat. "Fast gates green" is banned. Say "ran the quick tests again. they passed." Every line works for someone who just walked in.
- Info stays right. Voice is dumb. Facts are not.
- One session only. Default. `/cte default on` makes it sticky.

## Install

Point omp at the repo. No clone. No folder to keep. omp keeps its own copy.

```bash
omp plugin marketplace add wvmag/cte-mode
omp plugin install --scope user cte-mode@cte-mode
```

Update:

```bash
omp plugin marketplace update cte-mode
omp plugin upgrade --scope user cte-mode@cte-mode
```

Uninstall:

```bash
omp plugin uninstall --scope user cte-mode@cte-mode
omp plugin marketplace remove cte-mode
```

## Files

- `extensions/cte-mode.js` — the toggle
- `skills/cte/SKILL.md` — the rules the agent gets

Toggle code ported from i-have-adhd (Ayoub Ghriss, MIT). Good design. Reused it.

## Note

`omp -p "/cte on"` one-shot run does not save the toggle. Print mode. No session save. Interactive and `omp -c` resume work fine.

## License

MIT
