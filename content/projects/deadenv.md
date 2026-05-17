---
title : 'Deadenv'
subtitle: 'Replacing .env files with OS-native secret storage'
date : '2026-05-16T00:09:59+05:30'
draft : false
tags : ['go', 'security', 'cli', 'devtools']
toc: true
next: true
image: '/blog-assets/deadenv_header.png'
---

Every developer I know has a `.env` file they shouldn't. Maybe it has a production API key. Maybe it's tracked in git with a `.gitignore` entry that someone forgot to add. Maybe it's just sitting there, world-readable, on a shared dev machine. We all know it's bad. We keep doing it anyway because there's no real alternative that doesn't add significant friction.

`deadenv` is my attempt to fix that. It's a cross-platform CLI tool written in Go that stores secrets in the OS-native keychain: Keychain on macOS, libsecret/GNOME Keyring on Linux, Credential Manager on Windows, and injects them into subprocesses at runtime. Secrets never touch the filesystem in plaintext.

This post is about why I built it and, more importantly, the architectural decisions that went into making it work across three platforms without becoming a mess.

## The Problem With .env Files

`.env` files are a collective security debt the dev community carries because the tooling around them is convenient and the consequences are deferred. The specific failure modes:

**Plaintext on disk.** Any process running as your user can read your `.env`. That includes malicious packages in your `node_modules`, random scripts you piped from the internet, and any other tool you've installed without reading carefully.

**Accidental commits.** `.gitignore` is not a guarantee. A `git add .` at the wrong moment, a `--force`, a renamed file that no longer matches the ignore pattern, all of these have happened to real people with real credentials.

**Shell history leakage.** When developers don't have a `.env` setup, they often export variables inline: `API_KEY=abc123 npm start`. That's now in your shell history, potentially synced somewhere.

**No audit trail.** There's no way to know who changed a value or when without inspecting git blame on the `.env` file itself. Which only works if you were committing it in the first place.

The existing alternatives all have real tradeoffs. Vault and AWS Secrets Manager are production-grade tools with significant ops overhead, which is overkill for a dev machine. 1Password CLI and similar tools are good but require subscriptions and are opinionated about team workflows. Most `.env` wrappers just add another layer of indirection without fixing the plaintext-on-disk problem.

I wanted something that behaved like `dotenv` but stored credentials where the OS intended them to be stored.

## What deadenv Does

The core workflow is designed to be familiar:

```bash
# create a profile (opens $EDITOR for input, or import from an existing file)
deadenv profile new myapp --from=.env.local

# set individual keys
deadenv set myapp DATABASE_URL "postgres://localhost/mydb"

# run your app with secrets injected into the subprocess
deadenv run myapp -- npm start

# export to current shell (for tools that read the environment directly)
eval $(deadenv export myapp)
```

Profiles are named collections of key-value pairs. A profile maps roughly to a single `.env` file. Secrets are stored in the OS keychain under a service name of `deadenv/<profile>`, with the key name as the account. The app never writes them to disk.

Team sharing works through encrypted export files:

```bash
# team lead exports
deadenv export myapp --out=myapp
# produces myapp.deadenv, encrypted with AES-256-GCM

# new team member imports
deadenv import myapp.deadenv
```

The `.deadenv` file is safe to share over any channel. The decryption password goes via a separate secure channel.



## Architecture

### Interface-First Design

The first decision was to put the entire keychain behind an interface:

```go
type Store interface {
    Write(service, account, value string) error
    Read(service, account, prompt string) (string, error)
    Delete(service, account string) error
    List(service string) ([]string, error)
}
```

Every platform has its own implementation file with a build tag at the top:

```go
//go:build linux

package keychain
```

The rest of the codebase never imports a platform-specific file. They call `keychain.New()` and get back a `Store`. This kept the platform implementations completely isolated, so that I could write and test the Linux implementation without touching anything macOS-specific.

It also made testing straightforward. `FakeStore` lives in `internal/keychain/fake.go` (not a `_test.go` file, so it's available to all test packages), and every test that involves keychain operations uses it. The profile package tests, the edit flow tests, the history integration tests: all of them run against the fake without hitting a real keychain.

### Platform Keychain Implementations

Getting native keychain access right on each platform took the most effort.

**macOS** uses `Security.framework` via cgo. Items are written with `kSecAccessControlUserPresence`, which means the OS enforces Touch ID or device password on every read. The app doesn't implement authentication, it delegates entirely to the OS. The access control attribute `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` prevents iCloud sync and migration to another device, which is the right default for dev credentials. The prompt string (`kSecUseOperationPrompt`) is set to something human-readable so the Touch ID dialog says something useful instead of just the app name.

**Linux** uses libsecret via D-Bus, which gives access to GNOME Keyring and (with some effort) KWallet. I used the `go-keychain/secretservice` package for the D-Bus protocol. Secrets are stored with a structured attribute schema:

```
{
    "application": "deadenv",
    "profile":     "<profile-name>",
    "key":         "<KEY>"
}
```

This schema lets the list operation do a filtered search rather than fetching everything and filtering in Go. One thing that tripped me up: session negotiation. The code tries `AuthenticationDHAES` (which encrypts the D-Bus traffic) and falls back to `AuthenticationInsecurePlain` if that fails. Some desktop environments don't support the secure session type, so the fallback is necessary for broad compatibility.

**Windows** uses `wincred` (Windows Credential Manager) with target names in the format `deadenv/<profile>/<KEY>`. The items don't show up in Credential Manager's GUI in the obvious way, which confused some early testers, it's expected behavior since `deadenv` stores items with its own prefix, not under the generic Windows credentials category.

### The .env Parser

The parser is a pure function, it takes a string and returns `[]EnvPair` or an error. No I/O, no side effects, no dependencies outside the standard library. This meant I could iterate on it quickly with table-driven tests and fuzz it without any setup.

The parsing rules handle all the .env format variants I've seen in real projects:

- `KEY=VALUE`, `KEY = VALUE`, `KEY VALUE` (space delimiter when no `=`)
- `export KEY=VALUE`
- Double and single quoting, with escape sequences in double-quoted values
- Inline comments (` # comment`) stripped from unquoted values, preserved inside quotes
- URLs containing `#` (e.g. `http://example.com#anchor`) not incorrectly truncated
- Values containing `=` (base64 tokens, JDBC URLs) preserved correctly
- Empty values (`KEY=` and `KEY=""`)

One deliberate choice: unmatched quotes fall back to treating the value as a literal string rather than returning a parse error. This is lenient mode, and it matches what other `.env` tools do in practice. Real `.env` files in the wild have formatting quirks. Failing hard on them would break the `--from` import flow for users migrating off plaintext files.

The fuzz test runs in CI:

```go
func FuzzParseEnvContent(f *testing.F) {
    f.Add("KEY=VALUE\n")
    f.Add("KEY = VALUE\n")
    f.Fuzz(func(t *testing.T, data string) {
        _, _ = ParseEnvContent(data)
        // must never panic
    })
}
```

It's caught a few edge cases that the table-driven tests missed.

### Git-Backed Audit Trail

Every mutation: set, unset, delete: is auto-committed to a local git repo at `~/.config/deadenv/history/`. Each profile has a corresponding JSON snapshot file that records key names, operation types, timestamps, and hashed values:

```json
{
  "profile": "myapp",
  "keys": {
    "DATABASE_URL": {
      "op": "set",
      "value_hash": "a3f1b2...",
      "updated_at": "2025-04-19T10:00:00Z"
    }
  }
}
```

The hash is `SHA-256(salt + value)` where the salt is a fixed per-installation random string stored at `~/.config/deadenv/history/.salt`. The point of the hash is to prove that a value changed between two commits without revealing the value. You can look at the git log and see that `DATABASE_URL` was modified at 14:30 and know whether the current value is the same as or different from some point in the past.

Commit messages follow a structured format: `[myapp] set DATABASE_URL`, `[myapp] unset OLD_KEY`, `[myapp] import (8 keys)`. This makes the git log readable as an audit trail.

If `git` isn't on PATH, history silently no-ops. There's a one-time warning at startup, but it doesn't block any operations. This was a deliberate UX decision, that the tool should work in minimal environments without making history tracking a hard dependency.

### Export Encryption

The `.deadenv` export format is a JSON envelope:

```json
{
  "version": 1,
  "profile": "myapp",
  "created_at": "2025-04-19T10:00:00Z",
  "kdf": {
    "algorithm": "argon2id",
    "salt": "<base64>",
    "time": 2,
    "memory": 131072,
    "threads": 4
  },
  "nonce": "<base64>",
  "ciphertext": "<base64>"
}
```

The encryption scheme: Argon2id derives a 32-byte key from the sharing password and a random salt. AES-256-GCM encrypts `json.Marshal([]EnvPair)`. The nonce is 12 bytes of `crypto/rand`. Salt is 32 bytes of `crypto/rand`. The file is written with `0600` permissions.

Two details worth explaining:

**Self-describing KDF parameters.** The Argon2id parameters (time, memory, threads) are stored in the file itself. This means the import side doesn't need to know what parameters were used at export time, it reads them from the envelope and uses them to re-derive the key. It also means I can change the parameters in a future version without breaking old exports.

**GCM auth tag behavior.** AES-256-GCM produces an authentication tag that covers both the ciphertext and any additional data. If the tag verification fails, whether because of a wrong password or because the file was corrupted in transit. You get the same error: `decryption failed — wrong password or file is corrupted`. This is intentional. Distinguishing between wrong password and corrupted file would create an oracle that could leak information about the password.

All sensitive byte slices (`key`, `salt`, `nonce`, `plain`) are explicitly zeroed after use:

```go
defer func() {
    for i := range key { key[i] = 0 }
}()
```

Go's GC doesn't guarantee immediate collection, so zeroing reduces the window during which the key lives in memory.

### Thin CLI Layer

The `cmd/` package is pure wiring. Each file registers subcommands and immediately delegates to `internal/`. There's no business logic in the CLI handlers. All errors propagate back to `main.go`, which maps sentinel errors to exit codes and user-facing messages:

```go
if errors.Is(err, keychain.ErrAuthDenied) {
    fmt.Fprintln(os.Stderr, "authentication denied")
    os.Exit(2)
}
if errors.Is(err, crypto.ErrDecryptFailed) {
    fmt.Fprintln(os.Stderr, "decryption failed — wrong password or file is corrupted")
    os.Exit(3)
}
```

The exit code table is documented: `0` success, `1` general error, `2` auth denied, `3` decrypt failed, `4` parse error, `127` command not found, `N` propagated subprocess exit code. This makes `deadenv run` composable in scripts, the exit code from the subprocess passes through unchanged.

### The `deadenv edit` Flow

`deadenv edit <profile>` is the most complex command. The flow:

1. Trigger OS auth and read all current key-value pairs from the keychain
2. Serialize them as `KEY=VALUE` with a comment header documenting accepted formats
3. Write to a temp file with `0600` permissions
4. Open `$EDITOR` (fallback chain: `$DEADENV_EDITOR`, `$VISUAL`, `$EDITOR`, `vi`)
5. After the editor exits, parse the saved content
6. Diff old pairs vs new pairs using `DiffPairs()` — a pure function that returns added, modified, and removed slices
7. If the diff is empty, return early with "no changes detected"
8. Show a summary (key names only, no values) and prompt for confirmation
9. Apply the delta: write added and modified keys, delete removed keys
10. Each changed key is a separate keychain write and a separate git commit

The temp file is deleted immediately after the editor exits, regardless of whether an error occurs. If a keychain write fails partway through, already-written changes are not rolled back - keychain writes aren't transactional. The error message reports which keys succeeded and which failed.

Treating a key rename (old key gone, new key present) as unset + set rather than an in-place rename was a deliberate choice. The keychain doesn't have a rename primitive, and the audit log is cleaner when it explicitly records both operations.



## What Was Harder Than Expected

**cgo on macOS.** Cross-compiling doesn't work when you're using cgo, which `Security.framework` requires. Building for macOS has to happen on macOS. I knew this going in, but the build matrix setup in CI took longer to get right than I expected.

**D-Bus session negotiation on Linux.** The DHAES session type (which encrypts the D-Bus traffic carrying secrets) isn't universally supported. Some desktop environments and keyring implementations only support the plain session type. The fallback logic is straightforward but it took real testing on different Linux setups to realize it was necessary. Running headless (no D-Bus session available at all) fails with a clear error rather than silently degrading, which is the right call.

**Shell escaping for `eval` output.** `deadenv export myapp` prints `export KEY=VALUE` lines for shell evaluation. Getting the escaping right - values with spaces, embedded single quotes, newlines, equals signs. It is one of those things that seems simple until you write the tests. Single-quote wrapping with `'\''` for embedded single quotes is the correct approach; I got it wrong the first time.



## What Went Well

The interface design made the whole project much easier to navigate than I expected. Being able to develop the parser, crypto, history, and profile packages independently. All tested against fakes, meant I could iterate quickly without setting up a real keychain every time I ran tests.

The parser being a pure function paid off immediately. Writing a fuzz test took five minutes and it found a panic in the comment-stripping logic within the first few seconds.

The phased implementation plan (parser → keychain interface → profile logic → history → real platform implementations → editor flow → crypto → CLI wiring) meant that at every phase there was something testable and working. I never had a large chunk of code that wasn't integrated into anything.


## Try It

```bash
git clone https://github.com/funinkina/deadenv.git
cd deadenv
make build
./bin/deadenv --help
```

Linux requires `libsecret-1-dev` and `pkg-config`. macOS requires Xcode Command Line Tools for the cgo compilation.

The README has a full CLI reference and use case walkthrough. Issues and PRs welcome.
