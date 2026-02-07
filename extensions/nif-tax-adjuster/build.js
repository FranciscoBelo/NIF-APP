// Simple build script for the function
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create dist directory
try {
  mkdirSync('dist', { recursive: true });
} catch (e) {
  // Directory exists
}

// Copy index.js to dist
const source = readFileSync('src/index.js', 'utf-8');
writeFileSync('dist/index.js', source);

console.log('Build completed successfully');
