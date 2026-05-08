import { defineConfig, type Plugin } from 'vite';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const decompRoot = resolve(here, '..', '..', 'decomps', 'pokeemeraude');
// memory/ vit chez l'user dans .claude/projects — chemin Windows hardcodé pour
// le dev de session 122. Si quelqu'un d'autre clone le projet, les POST vers
// /__dev/audit-reports/* échoueront silencieusement (= localStorage fallback).
const memoryRoot = 'C:/Users/Undi/.claude/projects/D--Downloads-Pokechill-NEWUPDATE/memory';

/** Dev-only plugin pour helpers Claude (= sub-agent audit + debug) :
 *  - POST /__dev/audit-reports/<filename>.md  → écrit dans memory/<filename>
 *  - GET  /__decomp/<path>                    → lit fichier décomp source
 *  Skip en prod (= vite build). Aucun risque collision routes app. */
function claudeDevHelpersPlugin(): Plugin {
  return {
    name: 'claude-dev-helpers',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // POST /__dev/audit-reports/<filename> → save to memory/
        if (req.method === 'POST' && req.url.startsWith('/__dev/audit-reports/')) {
          const filename = req.url.slice('/__dev/audit-reports/'.length).split('?')[0];
          if (!/^[a-zA-Z0-9_.-]+\.md$/.test(filename)) {
            res.statusCode = 400;
            return res.end('invalid filename');
          }
          let body = '';
          req.setEncoding('utf-8');
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              if (!existsSync(memoryRoot)) await mkdir(memoryRoot, { recursive: true });
              const target = join(memoryRoot, filename);
              await writeFile(target, body, 'utf-8');
              console.log(`[claude-dev-helpers] saved audit report → ${target}`);
              res.statusCode = 200;
              res.end(JSON.stringify({ saved: target, bytes: body.length }));
            } catch (e) {
              res.statusCode = 500;
              res.end(String(e));
            }
          });
          return;
        }

        // GET /__decomp/<path> → read decomp file
        if (req.method === 'GET' && req.url.startsWith('/__decomp/')) {
          const reqPath = req.url.slice('/__decomp/'.length).split('?')[0];
          if (reqPath.includes('..')) {
            res.statusCode = 400;
            return res.end('no traversal');
          }
          try {
            const target = join(decompRoot, reqPath);
            const content = await readFile(target, 'utf-8');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.statusCode = 200;
            return res.end(content);
          } catch (e) {
            res.statusCode = 404;
            return res.end(String(e));
          }
        }

        return next();
      });
    },
  };
}

export default defineConfig({
  plugins: [claudeDevHelpersPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(here, 'index.html')
      }
    }
  },
  server: {
    port: 5173,
    open: '/'
  }
});
