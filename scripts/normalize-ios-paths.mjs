import { readFileSync, writeFileSync } from 'node:fs';

// Capacitor's Windows sync emits backslashes in Swift package paths.
// Use portable paths so the committed project also opens correctly on macOS.
const file = new URL('../ios/App/CapApp-SPM/Package.swift', import.meta.url);
const source = readFileSync(file, 'utf8');
const normalized = source.replace(/(path:\s*")([^"]+)(")/g,
  (_, prefix, path, suffix) => prefix + path.replace(/\\/g, '/') + suffix);
if (normalized !== source) writeFileSync(file, normalized);
