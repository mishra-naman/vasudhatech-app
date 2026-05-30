# Checkpoint: Save progress

Before proceeding to the next phase:

1. Run `git add -A && git status` to see what changed
2. Run all TypeScript checks: `npx tsc --noEmit`
3. Run the dev server: `npm run dev` — confirm no crashes
4. Write a brief summary of what was completed in this phase
5. Commit with message: "checkpoint: phase N complete — [summary]"
6. List any issues, TODOs, or decisions deferred to the next phase

Output the checkpoint report in this format:
## Checkpoint: Phase [N] — [Name]
### Completed
- [list of completed items]
### Files created/modified
- [file paths]
### Deferred
- [items pushed to later phases]
### Next phase
- [what comes next]
