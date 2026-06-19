#!/usr/bin/env node
/**
 * Generates an RS256 key pair for JWT signing.
 * Run: node pulseRewards/backend/scripts/generate-jwt-keys.js
 *
 * Copy the output into pulseRewards/.env:
 *   JWT_PRIVATE_KEY=...
 *   JWT_PUBLIC_KEY=...
 */
const { generateKeyPairSync } = require('crypto');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Escape newlines for single-line .env usage
const toEnvValue = (pem) => pem.replace(/\n/g, '\\n');

console.log('# Paste these into pulseRewards/.env\n');
console.log(`JWT_PRIVATE_KEY="${toEnvValue(privateKey)}"`);
console.log(`JWT_PUBLIC_KEY="${toEnvValue(publicKey)}"`);
