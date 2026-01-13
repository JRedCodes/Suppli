/**
 * Environment variable validation script
 * Run this to verify all required environment variables are set
 */

import dotenv from 'dotenv';

// Load environment variables from .env.local BEFORE importing config
dotenv.config({ path: '.env.local' });

// Import config after env is loaded to ensure values are picked up
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('../src/config/index');

interface ValidationResult {
  variable: string;
  status: 'ok' | 'missing' | 'invalid';
  message: string;
}

const results: ValidationResult[] = [];

// Validate Supabase configuration
if (!config.supabase.url) {
  results.push({
    variable: 'SUPABASE_URL',
    status: 'missing',
    message: 'Required: Supabase project URL',
  });
} else if (!config.supabase.url.startsWith('https://')) {
  results.push({
    variable: 'SUPABASE_URL',
    status: 'invalid',
    message: 'Must start with https://',
  });
} else {
  results.push({
    variable: 'SUPABASE_URL',
    status: 'ok',
    message: '✓ Set',
  });
}

if (!config.supabase.serviceRoleKey) {
  results.push({
    variable: 'SUPABASE_SERVICE_ROLE_KEY',
    status: 'missing',
    message: 'Required: Supabase service role key',
  });
} else {
  results.push({
    variable: 'SUPABASE_SERVICE_ROLE_KEY',
    status: 'ok',
    message: '✓ Set',
  });
}

// Validate Stripe configuration
if (!config.stripe.secretKey) {
  results.push({
    variable: 'STRIPE_SECRET_KEY',
    status: 'missing',
    message: 'Required: Stripe secret key (starts with sk_)',
  });
} else if (!config.stripe.secretKey.startsWith('sk_')) {
  results.push({
    variable: 'STRIPE_SECRET_KEY',
    status: 'invalid',
    message: 'Must start with sk_',
  });
} else {
  results.push({
    variable: 'STRIPE_SECRET_KEY',
    status: 'ok',
    message: '✓ Set',
  });
}

if (!config.stripe.webhookSecret) {
  results.push({
    variable: 'STRIPE_WEBHOOK_SECRET',
    status: 'missing',
    message: 'Required: Stripe webhook secret (starts with whsec_)',
  });
} else if (!config.stripe.webhookSecret.startsWith('whsec_')) {
  results.push({
    variable: 'STRIPE_WEBHOOK_SECRET',
    status: 'invalid',
    message: 'Must start with whsec_',
  });
} else {
  results.push({
    variable: 'STRIPE_WEBHOOK_SECRET',
    status: 'ok',
    message: '✓ Set',
  });
}

// Validate server configuration
results.push({
  variable: 'NODE_ENV',
  status: 'ok',
  message: `✓ ${config.server.nodeEnv}`,
});

results.push({
  variable: 'PORT',
  status: 'ok',
  message: `✓ ${config.server.port}`,
});

// Print results
console.log('\n🔍 Environment Variable Validation\n');
console.log('─'.repeat(60));

let hasErrors = false;

for (const result of results) {
  const icon = result.status === 'ok' ? '✓' : result.status === 'missing' ? '✗' : '⚠';
  const color = result.status === 'ok' ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(`${color}${icon}${reset} ${result.variable.padEnd(30)} ${result.message}`);

  if (result.status !== 'ok') {
    hasErrors = true;
  }
}

console.log('─'.repeat(60));

if (hasErrors) {
  console.log('\n❌ Some required environment variables are missing or invalid.');
  console.log('\n📝 Next steps:');
  console.log('   1. Copy server/.env.example to server/.env.local');
  console.log('   2. Fill in the required values');
  console.log('   3. See docs/ENVIRONMENT_VARIABLES.md for instructions');
  console.log('\n');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set correctly!\n');
  process.exit(0);
}
