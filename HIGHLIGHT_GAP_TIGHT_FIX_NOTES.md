# Scentivity Highlight Gap Tight Fix

Changes made:
- Removed the large blank space between the moving highlight pills and the Now Showing section.
- Tightened top/bottom padding around the highlight section.
- Added another CSS cache-busting query so the new spacing loads after deployment.

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
