# Security policy

## Public release boundary

This project installs a JSON Fragment and one local PNG below the current user's Windows Terminal Fragment directory. It may create Start-menu shortcuts. The optional default-profile command edits only the current user's `settings.json`, creates a timestamped backup beside it, and records the previous default for restoration.

It does not replace `wt.exe`, PowerShell, or CMD; does not install a watcher, service, scheduled task, startup entry, or listener; and does not require a debugging endpoint. The repository must not contain account data, tokens, user screenshots, generated backups, settings files, target binaries, or local runtime state.

## Compatibility

Every compatibility claim is tied to the exact version listed in `PRE_RELEASE.md`. Updates to the target application require a new verification pass before release.

## Reporting

Do not include private account or session material in a report. Use GitHub Security Advisories for vulnerabilities and ordinary Issues for non-sensitive compatibility defects.
