import { execSync } from 'node:child_process'

console.log('🔨 Running DXT build as part of semantic-release prepare step...');
execSync('npm run build:dxt', { stdio: 'inherit' });