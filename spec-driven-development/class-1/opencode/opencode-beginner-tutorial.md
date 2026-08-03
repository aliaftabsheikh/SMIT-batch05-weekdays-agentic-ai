# OpenCode: The Complete Beginner's Tutorial
### From Zero to Building Your First Python Project with an AI Coding Agent

> **What is OpenCode?** OpenCode is a free, open-source AI coding agent that runs in your terminal. Think of it as having a senior developer sitting inside your command line — you describe what you want in plain English, and it reads your code, writes files, runs commands, and fixes bugs for you. It works with almost any LLM provider (Anthropic, OpenAI, Google Gemini, OpenRouter, GitHub Copilot, local models, and more).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation (All Platforms)](#2-installation)
3. [Connecting a Model Provider (Auth)](#3-connecting-a-model-provider)
4. [Your First Session — The TUI](#4-your-first-session--the-tui)
5. [Slash Commands (Inside the TUI)](#5-slash-commands-inside-the-tui)
6. [Keyboard Shortcuts You Must Know](#6-keyboard-shortcuts)
7. [Agents: Build vs Plan](#7-agents-build-vs-plan)
8. [Full CLI Command Reference](#8-full-cli-command-reference)
9. [Configuration: opencode.json](#9-configuration-opencodejson)
10. [Custom Commands](#10-custom-commands)
11. [MCP Servers](#11-mcp-servers)
12. [🚀 MINI PROJECT: Build a Python Expense Tracker with OpenCode](#12-mini-project-python-expense-tracker)
13. [Automation with `opencode run`](#13-automation-with-opencode-run)
14. [Troubleshooting & Maintenance](#14-troubleshooting--maintenance)
15. [Best Practices Cheat Sheet](#15-best-practices-cheat-sheet)

---

## 1. Prerequisites

Before installing OpenCode, make sure you have:

| Requirement | Why | Check with |
|---|---|---|
| A terminal | OpenCode is terminal-first | Any modern terminal (Windows Terminal, iTerm2, Ghostty, etc.) |
| An API key OR free provider | The AI brain behind OpenCode | Anthropic / OpenAI / Google Gemini / OpenRouter / GitHub Copilot |
| Python 3.10+ | For our mini project | `python --version` |
| Git (recommended) | OpenCode works best inside git repos | `git --version` |

**Windows users:** For the best experience, use **WSL (Windows Subsystem for Linux)**. OpenCode also works natively via `scoop` or `choco`, but WSL gives full compatibility.

```bash
# Install WSL (run in PowerShell as Administrator)
wsl --install
```

---

## 2. Installation

Pick ONE method for your platform:

### Method A — Install Script (Linux / macOS / WSL) ✅ Recommended
```bash
curl -fsSL https://opencode.ai/install | bash
```

You can control where it installs:
```bash
# Install to a specific directory
OPENCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://opencode.ai/install | bash

# Or use XDG bin directory
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://opencode.ai/install | bash
```

### Method B — npm / bun / pnpm / yarn (any OS with Node.js)
```bash
npm install -g opencode-ai@latest
# or
bun install -g opencode-ai@latest
# or
pnpm install -g opencode-ai@latest
```

### Method C — Windows native
```powershell
scoop install opencode
# or
choco install opencode
```

### Method D — macOS / Linux via Homebrew
```bash
# Recommended: the OpenCode tap (always up to date)
brew install anomalyco/tap/opencode

# Official Homebrew formula (updated less frequently)
brew install opencode
```

### Method E — Arch Linux
```bash
sudo pacman -S opencode      # stable
paru -S opencode-bin         # latest from AUR
```

### Verify Installation
```bash
opencode --version
```
If you see a version number — congratulations, you're ready! 🎉

---

## 3. Connecting a Model Provider

OpenCode needs an AI model to work. It supports 75+ providers via [Models.dev](https://models.dev).

### The Main Command: `opencode auth`

```bash
# Log in to a provider (interactive — pick from a list)
opencode auth login
```

This walks you through:
1. Selecting a provider (Anthropic, OpenAI, Google, OpenRouter, etc.)
2. Pasting your API key
3. Credentials are stored in `~/.local/share/opencode/auth.json`

**Other auth commands:**
```bash
opencode auth list       # See all authenticated providers
opencode auth ls         # Short version of the same
opencode auth logout     # Remove a provider's credentials
```

### 💡 Free / Budget Options for Beginners
- **OpenCode Zen** — curated models, easiest for total beginners
- **Google Gemini** — generous free tier
- **OpenRouter** — one key, many models (some free)
- **GitHub Copilot** — if you already have a Copilot subscription
- **Local models** — point OpenCode at Ollama or any OpenAI-compatible endpoint

### List Available Models
```bash
opencode models             # Shows all models as provider/model
opencode models --refresh   # Refresh the model list
```

You can also use a `.env` file in your project — OpenCode automatically loads API keys from environment variables.

---

## 4. Your First Session — The TUI

The TUI (Terminal User Interface) is where you'll spend most of your time.

### Step 1: Go to your project folder
```bash
mkdir my-first-project && cd my-first-project
git init    # recommended — enables undo/redo safety
```

### Step 2: Launch OpenCode
```bash
opencode
```

You can also open a specific folder directly:
```bash
opencode /path/to/project
```

### Step 3: Initialize the project
Inside the TUI, type:
```
/init
```
This makes OpenCode **analyze your project** and create an `AGENTS.md` file in the project root. This file teaches OpenCode your project's structure and coding patterns.

> ✅ **Pro tip:** Commit `AGENTS.md` to Git. Every future session (and your teammates) will benefit.

### Step 4: Just talk to it!
Type in plain English:
```
Explain what this codebase does
```
```
Add a function that validates email addresses
```

### Referencing files with `@`
Press `@` and start typing — OpenCode fuzzy-searches your project files:
```
Explain what @src/utils/helpers.py does
```

---

## 5. Slash Commands (Inside the TUI)

These are typed inside the OpenCode TUI, starting with `/`:

| Command | What it does |
|---|---|
| `/init` | Analyze the project and create/update `AGENTS.md` |
| `/help` | Show help and keyboard shortcuts |
| `/undo` | Undo the last change OpenCode made |
| `/redo` | Redo a change you undid |
| `/share` | Create a shareable link to the current conversation |
| `/connect` | Connect a model provider from inside the TUI |
| `/new` | Start a new session (fresh context) |
| `/sessions` | List and switch between past sessions |
| `/models` | Switch the active model |
| `/compact` | Compress long conversation context to save tokens |
| `/exit` | Quit OpenCode |

> ⚠️ Conversations are **not shared by default** — `/share` only creates a link when you explicitly run it.

---

## 6. Keyboard Shortcuts

OpenCode uses a **leader key** (default: `Ctrl+X`) to avoid conflicts with your terminal. Many shortcuts are "Leader, then key".

| Shortcut | Action |
|---|---|
| `Tab` | Switch between primary agents (Build ↔ Plan) |
| `@` | Fuzzy-search and mention project files |
| `Esc` | Interrupt the agent mid-task |
| `Ctrl+X` then key | Leader-based shortcuts (see `/help`) |
| `↑ / ↓` | Navigate message history |

All keybinds are customizable in your config (Section 9).

---

## 7. Agents: Build vs Plan

OpenCode ships with two **primary agents** you cycle through with `Tab`:

### 🔨 Build (default)
- Full access: can edit files, run bash commands, do everything
- Use for: actually implementing features and fixes

### 📋 Plan (read-only)
- **Denies file edits by default**, asks permission before running commands
- Use for: exploring unfamiliar codebases, reviewing, designing before coding

> **Golden workflow:** Press `Tab` → switch to **Plan** → ask "How would you add feature X?" → review the plan → press `Tab` back to **Build** → say "Implement that plan".

### Subagents
Specialized helpers invoked with `@` in your message:
- `@general` — multi-step research and complex tasks (can edit files)
- A fast **read-only explorer** agent for searching code
- Hidden system agents (compaction, titles, summaries) run automatically

### Managing agents from the CLI
```bash
opencode agent create    # Guided creation of a custom agent (prompt + permissions)
opencode agent list      # List all available agents
```

`agent create` can run non-interactively if you pass all of `--path`, `--description`, `--mode`, and `--permissions`.

---

## 8. Full CLI Command Reference

These run in your normal shell (outside the TUI):

### Core
```bash
opencode                    # Start the TUI in current directory
opencode [path]             # Start TUI in a specific directory
opencode run "prompt"       # Non-interactive: run a prompt and print the result
opencode run --file app.py "Explain this file"   # Attach files to a prompt
```

### Auth & Models
```bash
opencode auth login         # Connect a provider
opencode auth list          # List connected providers
opencode auth logout        # Disconnect a provider
opencode models             # List available models (provider/model format)
opencode models --refresh   # Refresh model list
```

### Sessions & Data
```bash
opencode session list       # List saved sessions
opencode export             # Export a session (e.g., to JSON)
opencode import session.json            # Import a session file
opencode import https://opncd.ai/s/abc  # Import from a share link
opencode stats              # Token usage and cost statistics
```

### Server Modes
```bash
opencode serve              # Headless HTTP server (OpenAPI spec)
opencode web                # Headless server + browser web UI
opencode web --port 4096 --hostname 0.0.0.0   # Remote-accessible backend
opencode attach             # Attach a TUI to a running backend server
opencode acp                # Start an Agent Client Protocol server (nd-JSON over stdio)
```
> Set `OPENCODE_SERVER_PASSWORD` to protect `opencode web` with HTTP basic auth.

### GitHub Integration
```bash
opencode github install     # Install the GitHub agent (sets up Actions workflow)
opencode github run         # Run the GitHub agent (used in CI)
opencode pr <number>        # Fetch + checkout a GitHub PR branch, then run OpenCode
```

### Plugins, MCP & Agents
```bash
opencode plugin install <name>   # Install a plugin and update config
opencode agent create            # Create a custom agent
opencode agent list              # List agents
opencode mcp add                 # Add an MCP server (guided)
opencode mcp list                # List MCP servers + connection status
opencode mcp login <server>      # OAuth into an MCP server
opencode mcp logout <server>     # Remove OAuth credentials
opencode mcp debug <server>      # Debug MCP OAuth issues
```

### Maintenance
```bash
opencode upgrade            # Update to the latest version
opencode upgrade v0.5.0     # Update to a specific version
opencode db path            # Print the database path
opencode debug              # Debugging and troubleshooting tools
opencode uninstall          # Remove OpenCode and all related files
```

---

## 9. Configuration: `opencode.json`

Place `opencode.json` in your project root (project-level) or `~/.config/opencode/` (global).

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-6",
  "small_model": "anthropic/claude-haiku-4-5",

  "permission": {
    "edit": "ask",
    "bash": "ask"
  },

  "server": {
    "port": 4096,
    "hostname": "127.0.0.1"
  },

  "lsp": {
    "python": {
      "command": "pyright-langserver",
      "args": ["--stdio"]
    }
  }
}
```

**Key options explained:**
- `model` — the default model (`provider/model` format from `opencode models`)
- `small_model` — cheaper model for lightweight tasks (titles, summaries)
- `permission` — safety! `"ask"` means OpenCode must confirm before editing files or running shell commands. Options: `"allow"`, `"ask"`, `"deny"`
- You can set permissions per bash command with glob patterns, e.g. allow `git *` but ask for everything else (put the `*` wildcard rule first — the last matching rule wins)
- `lsp` — connect language servers so OpenCode sees real diagnostics/errors

---

## 10. Custom Commands

Create your own slash commands as Markdown files:

**Locations:**
- Project: `.opencode/commands/`
- Global: `~/.config/opencode/commands/`

**Example** — create `.opencode/commands/test.md`:
```markdown
---
description: Run tests and fix any failures
agent: build
---
Run the project's test suite with pytest. If any tests fail,
analyze the failures and fix the code (not the tests) until all pass.
```
Now `/test` is available in the TUI!

**Named arguments** use `$UPPERCASE` placeholders:
```markdown
# Fix Issue $ISSUE_NUMBER
Fetch issue $ISSUE_NUMBER with gh, understand it, and implement a fix.
```

Custom commands can even **override built-ins** like `/init`.

---

## 11. MCP Servers

MCP (Model Context Protocol) gives OpenCode superpowers — external tools like GitHub, databases, browsers, and docs.

```bash
opencode mcp add        # Guided setup: choose local or remote server
opencode mcp list       # See servers + connection status
opencode mcp ls         # Short version
opencode mcp login      # Authenticate OAuth-enabled servers
```

Example use case: add a GitHub MCP server, then ask OpenCode *"List my open PRs and summarize the review comments."*

---

## 12. 🚀 MINI PROJECT: Python Expense Tracker

Time to build something real! We'll create a **CLI Expense Tracker** in Python — entirely by driving OpenCode with prompts. You write **zero code by hand**.

**What we're building:**
- Add expenses with amount, category, and note
- List all expenses in a table
- Monthly summary by category
- Data persisted to a JSON file
- Unit tests with pytest

### Step 0 — Project Setup

```bash
mkdir expense-tracker && cd expense-tracker
git init
python -m venv .venv
source .venv/bin/activate        # Windows WSL/Linux/macOS
pip install pytest
opencode
```

### Step 1 — Initialize

Inside the TUI:
```
/init
```
OpenCode scans the (empty) project and creates `AGENTS.md`.

### Step 2 — Plan First (Good Habit!)

Press `Tab` to switch to the **Plan** agent, then type:

```
I want to build a CLI expense tracker in Python with this structure:

- expense_tracker/
  - __init__.py
  - models.py      (Expense dataclass: amount, category, note, date)
  - storage.py     (save/load expenses to expenses.json)
  - cli.py         (argparse CLI: add, list, summary commands)
- tests/
  - test_storage.py
  - test_cli.py
- main.py          (entry point)

Requirements:
- Python 3.10+, standard library only (argparse, json, dataclasses, datetime)
- "add" command: python main.py add 500 food --note "biryani lunch"
- "list" command: prints a formatted table of all expenses
- "summary" command: totals per category for the current month
- Amounts stored in PKR
- Handle missing/corrupt JSON file gracefully

Give me an implementation plan. Do NOT write code yet.
```

Read the plan. Ask follow-up questions if anything is unclear:
```
Why did you choose a dataclass over a dict? Keep it simple.
```

### Step 3 — Build It

Press `Tab` to switch back to **Build**, then:

```
The plan looks good. Implement it exactly as planned.
Write clean, commented, beginner-friendly code.
```

Watch OpenCode create every file. If `permission` is set to `"ask"`, approve each edit — great for learning what it's doing.

### Step 4 — Test the App Manually

Ask OpenCode to run it (or run it yourself):
```
Run these commands and show me the output:
1. python main.py add 500 food --note "biryani lunch"
2. python main.py add 1200 transport --note "fuel"
3. python main.py add 350 food --note "chai and samosa"
4. python main.py list
5. python main.py summary
```

Expected output looks something like:
```
DATE        CATEGORY    AMOUNT     NOTE
2026-07-08  food        500.00     biryani lunch
2026-07-08  transport   1200.00    fuel
2026-07-08  food        350.00     chai and samosa

=== July 2026 Summary ===
food        850.00 PKR
transport   1200.00 PKR
TOTAL       2050.00 PKR
```

### Step 5 — Write Tests

```
Write pytest tests in tests/ covering:
- Saving and loading expenses (use tmp_path fixture, don't touch real data)
- Adding an expense via the CLI
- Summary calculation with multiple categories
- Graceful handling of a corrupt JSON file
Then run pytest and fix anything that fails.
```

### Step 6 — Break It on Purpose (Learn Debugging!)

Open `storage.py` yourself and delete a random line. Then:
```
python main.py list is crashing. Find the bug and fix it.
```
Watch OpenCode read the traceback, locate the bug, and repair it. This is the #1 real-world skill.

### Step 7 — Use Undo/Redo

```
/undo
```
The fix disappears! Then:
```
/redo
```
It's back. This safety net is why we ran `git init`.

### Step 8 — Add a Feature with @ Mentions

```
In @expense_tracker/cli.py add a "delete" command that removes
an expense by its index number shown in the list output.
Update tests too, and run them.
```

### Step 9 — Polish & Document

```
1. Add a README.md with installation and usage instructions
2. Add type hints everywhere
3. Run the full test suite one final time
```

### Step 10 — Commit & Share

```
Write a good git commit message and commit all changes.
```
Then optionally:
```
/share
```
…to get a link you can send to a friend or mentor.

**🎉 You just built, tested, debugged, and documented a full Python project without writing a single line by hand — while learning how a professional drives an AI agent.**

---

## 13. Automation with `opencode run`

`opencode run` is the non-interactive mode — perfect for scripts and CI:

```bash
# One-shot question
opencode run "Explain how closures work in Python"

# Work on a file
opencode run --file main.py "Add docstrings to every function in this file"

# Chain in shell scripts
opencode run "Run pytest and summarize failures" > report.txt
```

Combine with the GitHub agent (`opencode github install`) and OpenCode can respond to issues and PRs automatically in GitHub Actions.

---

## 14. Troubleshooting & Maintenance

| Problem | Fix |
|---|---|
| `opencode: command not found` | Restart terminal, or add install dir to `PATH` |
| Model errors / 401 | `opencode auth list` → re-run `opencode auth login` |
| Model missing from list | `opencode models --refresh` |
| Weird TUI rendering | Use a modern terminal (Windows Terminal, Ghostty, iTerm2) |
| Long session getting dumb | `/compact` or `/new` for fresh context |
| Stuck / runaway agent | Press `Esc` to interrupt |
| Want latest version | `opencode upgrade` |
| Deep issues | `opencode debug`, check `opencode db path` |
| Full removal | `opencode uninstall` |

---

## 15. Best Practices Cheat Sheet

1. **Always `git init` first** — undo/redo plus git is a double safety net.
2. **Run `/init` in every new project** — and commit `AGENTS.md`.
3. **Plan before Build** — `Tab` to Plan agent for anything non-trivial.
4. **Keep `permission: "ask"` while learning** — you'll see and approve every action.
5. **Use `@` file mentions** — precise context beats vague descriptions.
6. **One task per prompt** — "add feature X" not "add X, Y, Z and refactor everything".
7. **Ask it to run the tests** — never accept code that hasn't been executed.
8. **`/compact` long sessions** — saves tokens and keeps the agent sharp.
9. **Check costs with `opencode stats`** — know your token spend.
10. **Create custom commands** for anything you type more than twice.

---

## Quick Command Reference Card

```
INSTALL      curl -fsSL https://opencode.ai/install | bash
START        opencode
AUTH         opencode auth login | list | logout
MODELS       opencode models [--refresh]
RUN          opencode run "prompt" [--file path]
SESSIONS     opencode session list | export | import
SERVER       opencode serve | web | attach | acp
GITHUB       opencode github install | run  •  opencode pr <n>
MCP          opencode mcp add | list | login | logout | debug
AGENTS       opencode agent create | list
PLUGINS      opencode plugin install <name>
MAINTAIN     opencode upgrade | stats | debug | uninstall

TUI SLASH    /init /help /undo /redo /share /connect /new
             /sessions /models /compact /exit
TUI KEYS     Tab (switch agent)  @ (file search)  Esc (interrupt)
```

---

*Tutorial written for OpenCode as of July 2026. OpenCode ships fast — always cross-check with the official docs at https://opencode.ai/docs when something looks different.*

**Happy building! 🚀**
