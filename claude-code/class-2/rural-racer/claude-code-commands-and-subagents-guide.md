# Claude Code: Custom Commands & Custom Subagents

### A hands-on guide for beginners

This guide teaches you two of the most useful ways to customize Claude Code:

1. **Custom slash commands** — saved prompts you trigger by typing `/name`.
2. **Custom subagents** — specialized helpers that work in their own separate context and report back.

Everything here is copy-paste ready. You'll build a real command and a real subagent by the end.

> **Before you start:** These features live inside **Claude Code**, Anthropic's terminal/desktop coding agent. You need Claude Code installed and a project folder open. If you can run `claude` in a terminal and see the prompt, you're ready.

---

## Part 1 — Custom Slash Commands

### What they are (in one sentence)

A slash command is a prompt you've saved to a file so you can run it instantly with `/name` instead of retyping the same instructions every time.

If you keep typing the same thing — *"review this for security issues,"* *"write a commit message for my changes,"* *"explain this file's architecture"* — that's a perfect candidate for a command.

### Where command files live

A command is just a Markdown file. Where you put it decides who can use it:

| Location | Scope | Use it for |
|---|---|---|
| `.claude/commands/` | **This project only** | Team workflows you commit to the repo |
| `~/.claude/commands/` | **All your projects** | Personal shortcuts you want everywhere |

The **filename becomes the command name**. A file called `review.md` becomes `/review`.

> **Modern note:** Anthropic now recommends the newer *Skills* format (`.claude/skills/<name>/SKILL.md`) which does everything commands do *plus* lets Claude trigger them on its own. The classic `.claude/commands/` format still works fully and is the simplest place to start, so this guide uses it. Once you're comfortable, the same ideas carry straight over to skills.

### Build your first command (do this now)

From inside your project folder:

```bash
mkdir -p .claude/commands
```

Create `.claude/commands/explain.md` with this content:

```markdown
Explain the architecture of this code.
Walk through the main components, how they connect,
and any patterns worth knowing. Keep it beginner-friendly.
```

That's the whole command. Now in Claude Code, type:

```text
/explain
```

Claude reads the file and runs it as if you'd typed the whole prompt. You just saved yourself from retyping three sentences forever.

### Passing arguments

Most commands are more useful when they take input. Use placeholders:

- `$ARGUMENTS` — everything the user typed after the command, as one blob
- `$0`, `$1`, `$2` … — individual words/arguments by position

Create `.claude/commands/fix-issue.md`:

```markdown
---
argument-hint: [issue-number] [priority]
description: Fix a GitHub issue
---

Fix issue #$0 with priority $1.
Read the issue description and implement the necessary changes.
```

Now running `/fix-issue 123 high` fills in `$0` = `123` and `$1` = `high`.

For a flexible single input, use `$ARGUMENTS`:

```markdown
---
description: Run tests matching a pattern
---

Run the tests matching: $ARGUMENTS

1. Detect the test framework (Jest, pytest, etc.)
2. Run the matching tests
3. If any fail, analyze and fix them, then re-run to confirm
```

Running `/test auth` puts `auth` into `$ARGUMENTS`.

### Pulling in live data with `!` (bash) and `@` (files)

Commands can grab real context *before* Claude starts thinking.

**Run a shell command and include its output** with `!` followed by a backtick command. **Pull in a file's contents** with `@filename`.

Here's a genuinely useful one — `.claude/commands/commit.md`:

```markdown
---
allowed-tools: Bash(git add *), Bash(git status *), Bash(git commit *)
description: Create a git commit from current changes
---

## Context
- Current status: !`git status`
- Current diff: !`git diff HEAD`

## Task
Write a clear, conventional commit message based on the changes
above, then create the commit.
```

When you run `/commit`, Claude already sees your real git status and diff — no copy-pasting required.

A file-reference example, `.claude/commands/review-config.md`:

```markdown
---
description: Review configuration files
---

Review these config files for security issues, outdated
dependencies, and misconfigurations:
- @package.json
- @tsconfig.json
```

### The frontmatter (the `---` block at the top)

That optional block between `---` lines configures the command. The most useful fields:

| Field | What it does |
|---|---|
| `description` | Shown in the `/` menu so you remember what it does |
| `argument-hint` | Hints the expected arguments (e.g. `[issue-number]`) |
| `allowed-tools` | Restricts which tools the command may use (e.g. `Read, Grep, Bash(git diff *)`) |
| `model` | Forces a specific model for this command |

Everything below the closing `---` is the actual prompt.

### Keeping commands organized (namespacing)

As you collect commands, group them in subfolders:

```text
.claude/commands/
├── frontend/
│   └── component.md     →  /component
├── backend/
│   └── api-test.md      →  /api-test
└── review.md            →  /review
```

The subfolder shows up as a label in the command's description but doesn't change the command name itself.

### A realistic command to copy

`.claude/commands/code-review.md` — a full review using your real diff:

```markdown
---
allowed-tools: Read, Grep, Glob, Bash(git diff *)
description: Comprehensive code review of recent changes
---

## Changed files
!`git diff --name-only HEAD~1`

## The changes
!`git diff HEAD~1`

## Review
Review the changes above for:
1. Code quality and readability
2. Security vulnerabilities
3. Performance implications
4. Test coverage
5. Missing documentation

Give specific, actionable feedback, organized by priority
(Critical / Warning / Suggestion).
```

---

## Part 2 — Custom Subagents

### What they are (in one sentence)

A subagent is a specialized helper with its own separate context window, its own instructions, and its own limited set of tools — it does a focused job and returns only a summary, keeping your main conversation clean.

### Why bother? The core idea

Imagine you ask Claude to "run the whole test suite and fix what's broken." That dumps thousands of lines of test output into your conversation, crowding out everything else.

A subagent does that messy work **in its own window** and hands back just the part you care about ("3 tests failed, here's why, here's the fix"). Benefits:

- **Keeps context clean** — verbose output stays out of your main chat
- **Enforces limits** — a "reviewer" subagent can be denied write access entirely
- **Specializes** — a focused system prompt makes it better at one job
- **Saves cost/time** — route simple work to a faster, cheaper model like Haiku

### You already have some (built-in subagents)

Claude Code ships with subagents it uses automatically:

- **Explore** — fast, read-only codebase searching (runs on Haiku)
- **Plan** — gathers context during plan mode
- **General-purpose** — handles complex multi-step tasks needing both exploration and edits

You don't configure these; Claude reaches for them on its own. Custom subagents are how you add your *own* specialists.

### The easiest way to create one: `/agents`

In Claude Code, run:

```text
/agents
```

This opens a guided menu. The fastest path:

1. Go to the **Library** tab → **Create new agent**
2. Choose **Personal** (saves to `~/.claude/agents/`, available everywhere) or **Project**
3. Pick **Generate with Claude** and describe what you want, e.g.:
   > *A code-improvement agent that scans files and suggests improvements for readability, performance, and best practices. It should explain each issue, show the current code, and provide an improved version.*
4. **Select tools** — for a reviewer, keep only the read-only tools (no Write/Edit)
5. **Pick a model** (Sonnet is a good default for analysis)
6. Save — it's usable immediately

This is the recommended way because Claude writes a good description and system prompt for you, and it loads without a restart.

### Creating one by hand

A subagent is also just a Markdown file with a frontmatter block. Put it in:

- `.claude/agents/` — project subagents (commit these to share with your team)
- `~/.claude/agents/` — personal subagents for all projects

Create `.claude/agents/code-reviewer.md`:

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

> **Important:** Subagents created by editing files directly load at session **start**. If you add or edit a file by hand, **restart Claude Code** to pick it up. (Ones made through `/agents` load immediately.)

### The frontmatter fields that matter most

Only `name` and `description` are required. The ones you'll actually use:

| Field | Required | What it does |
|---|---|---|
| `name` | ✅ | Lowercase-and-hyphens identifier (`code-reviewer`) |
| `description` | ✅ | **When Claude should delegate to it** — write this carefully |
| `tools` | | Allowlist of tools. Omit to inherit everything |
| `disallowedTools` | | Denylist — inherit everything *except* these (e.g. `Write, Edit`) |
| `model` | | `sonnet`, `opus`, `haiku`, or `inherit` (default) |
| `permissionMode` | | e.g. `plan` for read-only exploration |
| `memory` | | `user` / `project` / `local` for cross-session learning |
| `color` | | A label color so you can spot it running |

The body below the frontmatter is the subagent's **system prompt** — its personality and instructions.

### Controlling what a subagent can touch

This is one of the biggest reasons to use subagents. Two approaches:

**Allowlist** — only these tools, nothing else:

```yaml
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

**Denylist** — everything *except* these:

```yaml
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

A reviewer that physically *can't* modify your code is much safer than one you simply asked not to.

### Three ready-to-use subagents

**1. Code reviewer (read-only)** — `.claude/agents/code-reviewer.md`:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on the modified files
3. Begin the review immediately

Review checklist:
- Clear, readable code with good names
- No duplicated logic
- Proper error handling
- No exposed secrets or API keys
- Input validation present
- Reasonable test coverage

Organize feedback by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Always include a concrete example of how to fix each issue.
```

**2. Debugger (can read AND fix)** — `.claude/agents/debugger.md`:

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture the error message and stack trace
2. Identify reproduction steps
3. Isolate where the failure happens
4. Implement a minimal fix
5. Verify the solution works

For each issue, report:
- Root cause (not just the symptom)
- Evidence for that diagnosis
- The specific code fix
- How you verified it

Fix the underlying cause, not the surface symptom.
```

Notice the difference: the reviewer has **no** `Edit` tool, the debugger does — because reviewing shouldn't change code, but debugging must.

**3. Data analyst (specialized domain)** — `.claude/agents/data-scientist.md`:

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries and data insights. Use proactively for data analysis tasks.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL analysis.

When invoked:
1. Understand the analysis requirement
2. Write efficient, well-filtered SQL queries
3. Run them and summarize the results
4. Present clear, data-driven findings and next steps

Explain your query approach, note any assumptions,
and keep queries efficient and cost-effective.
```

### How to actually invoke a subagent

Three levels of control:

**1. Just describe the task** — Claude decides whether to delegate (it uses the `description` field to choose):

```text
Use the code-reviewer subagent to look at my recent changes
```

**2. @-mention it** — guarantees that exact subagent runs for the task. Type `@` and pick it from the list:

```text
@code-reviewer look at the auth changes
```

**3. Run your whole session as it** — the entire session adopts that subagent's prompt, tools, and model:

```bash
claude --agent code-reviewer
```

### Three patterns worth knowing

**Isolate noisy work** — keep verbose output out of your main chat:

```text
Use a subagent to run the test suite and report only the
failing tests with their error messages.
```

**Run research in parallel** — several subagents at once on independent areas:

```text
Research the authentication, database, and API modules in
parallel using separate subagents.
```

**Chain them** — one feeds the next:

```text
Use the code-reviewer subagent to find performance issues,
then use the debugger subagent to fix them.
```

---

## When to use what

A quick decision guide so you don't overthink it:

| You want… | Use |
|---|---|
| A saved prompt you trigger yourself with `/name` | **Slash command** |
| A focused worker that runs in its own clean context and returns a summary | **Subagent** |
| Restricted tools / a cheaper model for a specific job | **Subagent** |
| Reusable instructions that Claude can *also* trigger automatically | **Skill** (the modern evolution of commands) |
| Quick back-and-forth where you need the full shared context | **Just the main conversation** |

Rule of thumb: **commands are shortcuts you fire; subagents are specialists you delegate to.**

---

## Quick reference cheat sheet

**Custom command**

```text
File:     .claude/commands/NAME.md   (project)
          ~/.claude/commands/NAME.md  (personal)
Run:      /NAME [arguments]
Inputs:   $ARGUMENTS  (all)   $0 $1 $2 (positional)
Live data: !`shell command`    @path/to/file
```

**Custom subagent**

```text
File:     .claude/agents/NAME.md   (project)
          ~/.claude/agents/NAME.md  (personal)
Create:   /agents  → Library → Create new agent
Required: name, description
Limit tools: tools: Read, Grep   OR   disallowedTools: Write, Edit
Invoke:   "use the NAME subagent…"  |  @NAME  |  claude --agent NAME
Reload:   restart session after editing files by hand
```

---

## Common beginner gotchas

- **Edited a file but nothing changed?** Subagents loaded from disk need a **session restart**. (`/agents`-created ones don't.)
- **Command name not appearing?** Check the filename — it *is* the command name, and it must end in `.md` inside `.claude/commands/`.
- **Subagent never gets used automatically?** Its `description` is how Claude decides when to delegate. Make it specific, and add "use proactively" to nudge it.
- **Worried a reviewer might change your code?** Don't just ask it not to — leave `Edit` and `Write` out of its `tools`, so it literally can't.
- **Sharing with teammates?** Put commands/subagents in the project folders (`.claude/commands/`, `.claude/agents/`) and commit them. Double-check no secrets are baked into any prompt first.

---

*Sources: Anthropic's official Claude Code documentation for slash commands and subagents (code.claude.com/docs), verified June 2026.*
