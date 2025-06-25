// render-build.js
const fs = require('fs');
const { execSync } = require('child_process');

// Create .npmrc file for Render
const npmrcContent = `
engine-strict=false
legacy-peer-deps=true
optional=false
`;

fs.writeFileSync('.npmrc', npmrcContent);

// Run the build
try {
  console.log('Running Vite build...');
  execSync('npx vite build --emptyOutDir', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}