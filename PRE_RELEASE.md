# Diana Windows Terminal Theme 0.3.0-beta.1

Status: **public GitHub Beta with an installable archive; stable release still pending**.

## Public implementation

- Uses the documented per-user Windows Terminal Fragment directory.
- Installs two opt-in profiles: `Diana PowerShell` and `Diana CMD`.
- The default profile changes only when the user chooses that route, and the previous value is recorded for restoration.
- Does not patch Windows Terminal binaries, open a port, install a watcher, or create startup persistence.

## Compatibility snapshot

- Last prepared against Windows Terminal `1.24.11911.0`.
- Minimum checked version in the installer: `1.24.0.0`.
- Compatibility is not claimed for a newer build until the final test is repeated.

## Final release gate

- Install with the independent route and open both profiles.
- Verify the background at normal, maximized, and narrow window sizes.
- Set Diana PowerShell as default, then uninstall and confirm the previous default returns.
- Create a shortcut for one `.cmd` and one `.ps1` test file.
- Run `npm test`, build the zip, inspect its file list, and verify its SHA-256.
- Confirm Task Manager and listening-port checks show no Diana background process.
