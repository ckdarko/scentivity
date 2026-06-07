# Scentivity Homepage Video Update

Changes made:
- Added a homepage autoplay video banner after the moving highlight section and before Now Showing.
- Video uses autoplay, muted, loop, and playsinline so it can play on phones.
- Added a default Scentivity MP4 video asset:
  assets/scentivity-homepage-video.mp4
- Added a poster image:
  assets/scentivity-video-poster.svg
- Added Homepage Video settings in /admin:
  - Enable Homepage Video
  - Video File
  - Poster Image
  - Headline
  - Subheading
  - Button Text
  - Button Link

How to change the video:
1. Go to /admin.
2. Open Scentivity Store → Products → Homepage Video.
3. Upload an MP4 under Video File.
4. Edit heading/subheading/button if desired.
5. Publish and redeploy.

Deploy:
1. Upload everything inside `scentivity_site` to GitHub root.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
3. Confirm page source includes:
   app-cacheproof-homepage-video-20260607.js
