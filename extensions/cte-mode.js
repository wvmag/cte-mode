import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const EXTENSION_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_PATH = join(EXTENSION_DIR, "..", "skills", "cte", "SKILL.md");
const STATE_ENTRY_TYPE = "cte-mode-state";
const RULES_MESSAGE_TYPE = "cte-mode-rules";
const DISABLED_MESSAGE_TYPE = "cte-mode-disabled";
const STATUS_KEY = "cte-mode";
const DISABLE_CONFIRMATION = "CTE mode off. Brain work fine again. Talk normal now.";
const STOP_PHRASES = new Set(["stop cte mode", "normal mode"]);
const RULES_HEADER =
  'CTE MODE ACTIVE. We both have CTE. The ruleset below applies to every response until turned off. "stop cte mode" or "normal mode" turns it off for this session.';
const DISABLED_NOTICE =
  "CTE MODE OFF. Ignore the cte ruleset injected earlier in this conversation and return to your default response style.";
const USAGE = "Usage: /cte [on|off] — this session. /cte default on|off — new sessions. /cte status.";

// The default file is the opt-in cross-session setting (ponytail's "default"
// pattern). Session toggles live in session entries; the file is only read
// when a session has no toggle entry of its own.
function getDefaultPath() {
  const configHome =
    process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(configHome, "cte-mode", "default");
}

function readDefault() {
  try {
    return readFileSync(getDefaultPath(), "utf8").trim() === "on";
  } catch {
    return false;
  }
}

function writeDefault(enabled) {
  const path = getDefaultPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, enabled ? "on\n" : "off\n", "utf8");
}

function stripFrontmatter(content) {
  return content
    .replace(
      /^---[^\S\r\n]*\r?\n[\s\S]*?\r?\n---[^\S\r\n]*(?:\r?\n|$)/,
      "",
    )
    .trim();
}

function loadRules() {
  let content;

  try {
    content = readFileSync(SKILL_PATH, "utf8");
  } catch (error) {
    throw new Error(
      `Unable to load cte rules from ${SKILL_PATH}: ${error.message}`,
    );
  }

  const rules = stripFrontmatter(content);
  if (!rules) {
    throw new Error(`The cte rules file is empty: ${SKILL_PATH}`);
  }

  return rules;
}

function getSavedState(ctx) {
  let savedState;

  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "custom" || entry.customType !== STATE_ENTRY_TYPE) {
      continue;
    }

    if (typeof entry.data?.enabled === "boolean") {
      savedState = entry.data.enabled;
    }
  }

  return savedState;
}

// Context inspection is advisory. If the session-manager API changes or
// cannot build context, report "not present" so the caller re-injects the
// rules instead of breaking session startup.
function contextMessages(sessionManager) {
  if (sessionManager === null || typeof sessionManager !== "object") {
    return [];
  }

  try {
    if (typeof sessionManager.buildSessionContext === "function") {
      const messages = sessionManager.buildSessionContext().messages;
      return Array.isArray(messages) ? messages : [];
    }

    if (typeof sessionManager.buildContextEntries === "function") {
      const entries = sessionManager.buildContextEntries();
      return Array.isArray(entries) ? entries : [];
    }
  } catch {
    return [];
  }

  return [];
}

// Only the newest marker counts: a later "disabled" notice cancels an earlier
// ruleset, and compaction drops summarized entries so the ruleset has to be
// injected again.
function latestMarkerIsActive(messages, activeType, disabledType) {
  let active = false;

  for (const message of messages) {
    if (message.role !== "custom" && message.type !== "custom_message") {
      continue;
    }

    if (message.customType === activeType) {
      active = true;
    } else if (message.customType === disabledType) {
      active = false;
    }
  }

  return active;
}

function rulesAreInContext(ctx) {
  return latestMarkerIsActive(
    contextMessages(ctx.sessionManager),
    RULES_MESSAGE_TYPE,
    DISABLED_MESSAGE_TYPE,
  );
}

export default function cteModeExtension(pi) {
  const rules = loadRules();
  let enabled = false;
  let defaultEnabled = readDefault();

  const updateStatus = (ctx) => {
    // Status is cosmetic: never let a theme proxy that throws before init
    // take down the extension.
    try {
      if (!enabled || !ctx?.ui?.setStatus) {
        ctx?.ui?.setStatus?.(STATUS_KEY, undefined);
        return;
      }

      const dot = ctx.ui.theme.fg("success", "●");
      const label = ctx.ui.theme.fg("accent", "CTE ON");
      ctx.ui.setStatus(STATUS_KEY, `${dot} 🧠 ${label}`);
    } catch {
      /* ignore */
    }
  };

  // Keep the conversation in sync with the current mode: inject the ruleset
  // once, never per request. Re-inject after compaction drops it.
  const syncContext = (ctx) => {
    const injected = rulesAreInContext(ctx);

    if (enabled && !injected) {
      pi.sendMessage(
        {
          customType: RULES_MESSAGE_TYPE,
          content: `${RULES_HEADER}\n\n${rules}`,
          display: false,
        },
        { triggerTurn: false },
      );
      return;
    }

    if (!enabled && injected) {
      pi.sendMessage(
        {
          customType: DISABLED_MESSAGE_TYPE,
          content: DISABLED_NOTICE,
          display: false,
        },
        { triggerTurn: false },
      );
    }
  };

  const restoreState = (ctx) => {
    defaultEnabled = readDefault();
    enabled = getSavedState(ctx) ?? defaultEnabled;
    updateStatus(ctx);
    syncContext(ctx);
  };

  const setEnabled = (nextEnabled, ctx) => {
    enabled = nextEnabled;
    pi.appendEntry(STATE_ENTRY_TYPE, { enabled });
    updateStatus(ctx);
    syncContext(ctx);
    ctx?.ui?.notify?.(
      enabled
        ? "CTE mode on. We both have CTE now. Say it simple."
        : "CTE mode off. Talk normal again.",
      "info",
    );
  };

  pi.registerCommand("cte", {
    description:
      "Toggle CTE mode: talk like we both have CTE (/cte [on|off], /cte default on|off, /cte status)",
    handler: async (args, ctx) => {
      const [primary, secondary] = args.trim().toLowerCase().split(/\s+/);

      if (primary === undefined || primary === "") {
        setEnabled(!enabled, ctx);
        return;
      }

      if (primary === "on") {
        setEnabled(true, ctx);
        return;
      }

      if (primary === "off" || primary === "stop") {
        setEnabled(false, ctx);
        return;
      }

      if (primary === "status") {
        ctx?.ui?.notify?.(
          `CTE mode: ${enabled ? "on" : "off"} this session • default ${defaultEnabled ? "on" : "off"} for new sessions`,
          "info",
        );
        return;
      }

      if (primary === "default") {
        if (secondary === "on" || secondary === "off") {
          writeDefault(secondary === "on");
          defaultEnabled = readDefault();
          ctx?.ui?.notify?.(
            `New sessions will start with CTE mode ${defaultEnabled ? "on" : "off"}. This session is still ${enabled ? "on" : "off"}.`,
            "info",
          );
          return;
        }

        ctx?.ui?.notify?.("Usage: /cte default on|off", "warning");
        return;
      }

      ctx?.ui?.notify?.(USAGE, "warning");
    },
  });

  pi.on("input", async (event, ctx) => {
    const input = event.text.trim().toLowerCase();

    // Keep the built-in skill command working as an alias without letting Pi
    // expand a second copy of the same rules into the conversation.
    if (input === "/skill:cte") {
      setEnabled(true, ctx);
      return { action: "handled" };
    }

    if (enabled && STOP_PHRASES.has(input)) {
      setEnabled(false, ctx);

      if (ctx.hasUI) {
        return { action: "handled" };
      }

      return {
        action: "transform",
        text: `Reply with exactly: ${DISABLE_CONFIRMATION}`,
      };
    }

    return { action: "continue" };
  });

  pi.on("session_start", async (_event, ctx) => restoreState(ctx));
  pi.on("session_tree", async (_event, ctx) => restoreState(ctx));
  pi.on("session_compact", async (_event, ctx) => syncContext(ctx));
}
