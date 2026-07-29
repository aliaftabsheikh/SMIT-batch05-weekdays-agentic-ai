---
description: Stage, commit, and push all changes to GitHub
argument-hint: [commit message]
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git status:*), Bash(git diff:*)
---

## Context

- Current git status:
!`git status`
- Current git diff (staged and unstaged changes):
!`git diff HEAD`

## Task

Push the current changes to GitHub:

1. Run `git add .` to stage all changes.
2. Commit the staged changes with `git commit -m "message"`.
   - If the user provided a message via $ARGUMENTS, use it as the commit message.
   - Otherwise, write a clear, concise commit message yourself based on the diff shown above (follow Conventional Commits style, e.g. `feat:`, `fix:`, `chore:`, `docs:`).
3. Run `git push` to push to the remote.
4. If the push fails because the branch has no upstream set, run `git push -u origin HEAD` instead.
5. Report back a short summary of what was committed and confirm the push succeeded.