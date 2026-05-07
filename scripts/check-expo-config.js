#!/usr/bin/env node

const { execFileSync } = require('child_process');
const path = require('path');

try {
  execFileSync('npx', ['expo', 'config', '--type', 'public'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  console.log('Expo config resolved successfully.');
} catch (error) {
  if (error.stdout) {
    process.stdout.write(error.stdout.toString());
  }

  if (error.stderr) {
    process.stderr.write(error.stderr.toString());
  }

  process.exit(error.status || 1);
}
