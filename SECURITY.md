# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please:

1. **Email**: See `.well-known/security.txt` for contact information
2. **Expected Response**: Within 48 hours
3. **Disclosure Timeline**: 90-day coordinated disclosure

## Security Measures

- **Memory Safety**: WASM (Rust) provides memory safety guarantees
- **Type Safety**: ReScript compile-time types
- **Sandboxing**: WASM runs in isolated linear memory
- **Permissions**: Deno explicit permissions (`--allow-read`, `--allow-write`)
- **Data Privacy**: Local-first, no network calls, no telemetry
- **Offline-First**: Works completely air-gapped

## Security Documentation

- **Threat Model**: See `THREAT_MODEL.md`
- **Security Contact**: See `.well-known/security.txt`

## CVE Process

If a CVE is assigned:
1. Acknowledgment within 24 hours
2. Patch development within 7-14 days
3. Security update release
4. Advisory on GitHub Security
5. CHANGELOG.md update
