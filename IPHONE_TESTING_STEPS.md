# iPhone Testing Steps

## What Works For Free

You can test the app on your iPhone for free as a PWA.

The app shell can open from your iPhone home screen after the first load. Real plant/tree identification and AI hazard analysis will still need internet access and a production AI/API connection.

## Install On iPhone From Your Mac

1. Keep the local server running on your Mac:

   ```bash
   cd "/Users/a/Documents/New project"
   python3 -m http.server 8080
   ```

2. Connect your iPhone to the same Wi-Fi as your Mac.

3. Open this in iPhone Safari:

   ```text
   http://As-Mac-mini.local:8080
   ```

4. Tap Share.

5. Tap Add to Home Screen.

6. Open VerdantRisk from the new home screen icon once while still on Wi-Fi. This lets the offline cache save the app files.

## Use It Without Wi-Fi

1. Turn off Wi-Fi on the iPhone.

2. Open VerdantRisk from the home screen icon.

3. The app shell should open from the offline cache.

4. Photo upload, the prototype flow, and local report screen can load offline.

## Use iPhone Cellular Data For Real Identification

The current prototype does not yet connect to a real plant ID or tree hazard AI API.

To use iPhone cellular data for real identification later, the app needs to be hosted at a public HTTPS URL, such as:

- GitHub Pages
- Cloudflare Pages
- Netlify free tier

Once hosted publicly, your iPhone can open the app on cellular data and the app can call internet APIs from that public HTTPS origin.

The best free next step is GitHub Pages or Cloudflare Pages. The local `As-Mac-mini.local` URL is only for your own Wi-Fi and is not the right setup for cellular testing.

## Why Cellular Does Not Fully Work From The Local URL

`http://As-Mac-mini.local:8080` points to your Mac on your local Wi-Fi network.

When your iPhone leaves that Wi-Fi, it cannot reach your Mac. The offline PWA cache can still open the saved app shell, but any real AI identification service must be reached through the internet from a public HTTPS-hosted app.
