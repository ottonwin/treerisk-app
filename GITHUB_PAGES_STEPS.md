# GitHub Pages Steps

## Best Free Path

Use GitHub Pages. It is free for a public static website and gives you an HTTPS link your iPhone can open on cellular data.

## One-Time Setup

1. Create a free GitHub account if you do not already have one.

2. Create a new public repository. Suggested name:

   ```text
   verdantrisk-app
   ```

3. In Terminal, from this project folder, connect the local app to GitHub:

   ```bash
   cd "/Users/a/Documents/New project"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/verdantrisk-app.git
   git add .
   git commit -m "Add VerdantRisk prototype"
   git push -u origin main
   ```

4. On GitHub, open the repository.

5. Go to Settings.

6. Go to Pages.

7. Under Build and deployment, choose:

   ```text
   Source: Deploy from a branch
   Branch: main
   Folder: /root
   ```

8. Save.

9. GitHub will give you a public URL like:

   ```text
   https://YOUR_USERNAME.github.io/verdantrisk-app/
   ```

## iPhone Use

1. Open the GitHub Pages URL in iPhone Safari.

2. Tap Share.

3. Tap Add to Home Screen.

4. Open the app from the home screen.

5. Cellular data will work because the app is hosted on public HTTPS.

## Important

This makes the prototype public. Do not commit private notes, secrets, API keys, or private photos.

For real plant/tree identification later, the public GitHub Pages app can call an internet API, but API keys should not be placed directly in browser code. Use a small backend/proxy before production.
