# Scentivity Highlight Overlap Fix

Changes made:
- Fixed the issue where NOW SHOWING overlapped/mixed with the moving highlight pills.
- Kept the spacing small, but added enough separation so the section title is readable.
- Removed the unsafe negative spacing effect from the previous update by overriding it with safer spacing.
- Added a new CSS cache-busting query in index.html.

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
