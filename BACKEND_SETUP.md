# Secure Plant ID Backend

The public GitHub Pages app must not contain the Pl@ntNet API key. Use a small backend proxy and store the key as a server-side secret.

## Free Option: Cloudflare Workers

1. Create or open a free Cloudflare account.

2. Install Wrangler locally if needed:

   ```bash
   npm install -g wrangler
   ```

3. Log in:

   ```bash
   wrangler login
   ```

4. From the app folder, set the secret:

   ```bash
   wrangler secret put PLANTNET_API_KEY
   ```

   Paste the Pl@ntNet API key when prompted.

5. Deploy:

   ```bash
   wrangler deploy
   ```

6. Wrangler will return a worker URL similar to:

   ```text
   https://treerisk-plant-id.YOUR_SUBDOMAIN.workers.dev
   ```

7. Edit `config.js` and set:

   ```js
   window.TREERISK_PLANT_ID_ENDPOINT = "https://treerisk-plant-id.YOUR_SUBDOMAIN.workers.dev";
   ```

8. Commit and push `config.js`.

## Current App Behavior

- The app no longer asks users for an API key.
- The app sends uploaded photos to `window.TREERISK_PLANT_ID_ENDPOINT`.
- The backend forwards the request to Pl@ntNet with the secret key.
- The key is never committed to GitHub.

## Required Public App Origin

The worker currently allows requests from:

```text
https://ottonwin.github.io
```

Local testing is also allowed from:

```text
http://localhost:8080
http://127.0.0.1:8080
```
