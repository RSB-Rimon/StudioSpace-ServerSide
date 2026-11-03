# AGENTS.md — studiospase-server

- `"type": "module"` — use ESM syntax (`import`, top-level `await` is valid).
- `.env` is required; it sets `MONGODB_URI`. `.env` is gitignored but the server crashes without it.
- The server uses top-level `await connectToMongoDB()`; `node index.js` connects before listening.
- Database: `studiospase`, collection: `addnewstudio` (note spelling).
- `index.js` line 62: `app.patch('/studios/:id'), async ...` is missing parentheses around the handler — syntax error that prevents the route from working. Fix is `app.patch('/studios/:id', async (req, res) => { ... })`.
- `npm test` is a stub (`echo "Error: no test specified" && exit 1`). No real tests exist.
- No CI/workflows, no `.cursor/rules`, no `opencode.json`.
- Dependencies: `express`, `mongodb`, `cors`, `dotenv`. Lockfile present (`package-lock.json`).
