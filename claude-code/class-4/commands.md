# Claude Code Commands Cheat Sheet

## 1. `/exit`

**What it does:**
Safely closes and ends your current active conversation/session with Claude Code.

---

## 2. `/resume`

**What it does:**
Used inside an active session to pull up your conversation history and switch directly into a different, older session without leaving the terminal environment.

> **Note:** To resume a previous session immediately when launching Claude Code from your terminal, use:
>
> ```bash
> claude -r
> ```

---

## 3. `/rename`

**What it does:**
Changes the title of your current active session.

**How to use it:**

```bash
/rename <your-custom-name>
```

**Example:**

```bash
/rename intro-session
```

This helps keep your saved session history organized.

---

## 4. `/btw` (By The Way)

**What it does:**
Allows you to ask a side question or look up a quick reference without polluting your main project's conversation context window.

**How to use it:**

```bash
/btw <your question>
```

**Example:**

```bash
/btw What is Flask in Python?
```

Claude will generate the answer side-by-side, and once you press the **Spacebar**, the temporary conversation disappears so it doesn't clutter your main context.

---

## 5. `/export`

**What it does:**
Exports your entire active session chat history into a file.

**How to use it:**

```bash
/export <filename>.md
```

**Example:**

```bash
/export project-notes.md
```

This creates a Markdown file in your project directory that can later be reused as documentation or context.

---

## 6. `/logout`

**What it does:**
Logs you out of your current Claude Code account.

**Useful for:**
Switching between personal and company-provided accounts.

---

## 7. `/login`

**What it does:**
Starts the authentication flow to sign in to a Claude Code account through your browser.

---

## 8. `/model`

**What it does:**
Opens a menu that allows you to switch between Anthropic's available models depending on your task.

### Available Models

| Model          | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| **Sonnet 4.6** | Balanced default model recommended for everyday coding tasks     |
| **Opus**       | Most powerful model, ideal for complex architecture and planning |
| **Haiku**      | Fastest and most cost-effective model for simple tasks           |

---

## 9. `/usage`

**What it does:**
Displays your token consumption metrics, including:

* Current session usage
* Hourly reset limits
* Weekly plan limits

---

## 10. `/extra-usage`

**What it does:**
Provides a quick-access link to purchase additional usage credits if you exhaust your plan limits.

**Examples:**

* $5 refill
* $10 refill
* Other available top-up options

---

## 11. `/stats`

**What it does:**
Displays statistics about your Claude Code usage, including:

* Total tokens used
* Model usage distribution
* Total active days
* Longest sessions
* Current usage streak

---

## 12. `/insights`

**What it does:**
Generates a detailed local HTML report analyzing your Claude Code usage patterns.

### The report may include:

* Efficiency analysis
* Prompt engineering recommendations
* Workflow optimization suggestions
* Usage trends and habits

---

## 13. `/config`

**What it does:**
Opens the configuration menu to customize Claude Code preferences.

### Common Settings

* Thinking Mode
* Verbosity Level
* Terminal Progress Bar
* Default Language
* Other system preferences

---

## 14. `/permissions`

**What it does:**
Opens a Text User Interface (TUI) for controlling what Claude Code can do on your system.

### Permission Options

| Setting   | Description                       |
| --------- | --------------------------------- |
| **Allow** | Automatically execute actions     |
| **Ask**   | Request approval before execution |
| **Deny**  | Block execution completely        |

### Examples

* File writing permissions
* Bash command execution
* Web search access
* Automated task permissions

---

## 15. `/theme`

**What it does:**
Changes the visual appearance of Claude Code within your terminal.

### Common Themes

* 🌙 Dark Mode
* ☀️ Light Mode
* Other supported terminal themes

---

# Quick Reference Table

| Command        | Purpose                        |
| -------------- | ------------------------------ |
| `/exit`        | End current session            |
| `/resume`      | Switch to a previous session   |
| `/rename`      | Rename current session         |
| `/btw`         | Ask a temporary side question  |
| `/export`      | Export session to Markdown     |
| `/logout`      | Sign out of Claude Code        |
| `/login`       | Sign in to Claude Code         |
| `/model`       | Change AI model                |
| `/usage`       | View token usage               |
| `/extra-usage` | Purchase additional credits    |
| `/stats`       | View usage statistics          |
| `/insights`    | Generate usage analysis report |
| `/config`      | Modify settings                |
| `/permissions` | Manage tool permissions        |
| `/theme`       | Change terminal theme          |
