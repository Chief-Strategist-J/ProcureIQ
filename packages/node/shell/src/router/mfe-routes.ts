import fs from 'fs';
import path from 'path';

export function getMFERewrites() {
  const registryPath = path.resolve(process.cwd(), '../shell/contracts/mfe-registry.yaml');
  let fileContents = '';
  
  try {
    if (fs.existsSync(registryPath)) {
      fileContents = fs.readFileSync(registryPath, 'utf8');
    } else {
      // Fallback relative to project root
      const fallbackPath = path.resolve(process.cwd(), 'contracts/mfe-registry.yaml');
      if (fs.existsSync(fallbackPath)) {
        fileContents = fs.readFileSync(fallbackPath, 'utf8');
      }
    }
  } catch (error) {
    console.warn('Could not load mfe-registry.yaml', error);
  }

  const rewrites = [];
  const lines = fileContents.split('\n');
  
  let currentRoute = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (line.startsWith('  /') && trimmed.endsWith(':')) {
      currentRoute = trimmed.slice(0, -1);
    } else if (currentRoute && trimmed.startsWith('url:')) {
      const url = trimmed.substring(4).trim();
      rewrites.push({
        source: `${currentRoute}`,
        destination: `${url}${currentRoute}`,
      });
      rewrites.push({
        source: `${currentRoute}/:path*`,
        destination: `${url}${currentRoute}/:path*`,
      });
      currentRoute = ''; // reset after finding url
    }
  }

  return rewrites;
}
