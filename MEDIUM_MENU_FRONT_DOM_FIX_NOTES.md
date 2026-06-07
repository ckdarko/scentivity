# Scentivity Medium Menu Front-Layer DOM Fix

This update is based on `scentivity_changed_files_only_medium_menu_fix`.

Changes made:
- Moved the menu panel outside the sticky header in the HTML so the video section cannot cover or clip it.
- Raised the menu panel/card z-index above all homepage content.
- Lowered the video layer only while the menu is open.
- Did not change the font style or text color in the video section.

Upload only:
- index.html
- styles.css

Then redeploy with Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
