# Three Main Categories Update

The shop main categories were simplified to:

1. Victoria's Secret Collection
2. Bath & Body Works Collection
3. Designer and Luxury Fragrances

What changed:
- Product filters now show only these three main categories.
- The admin dashboard main category dropdown now uses only these three options.
- Existing older categories are automatically mapped on the live site:
  - Old Victoria’s Secret entries → Victoria's Secret Collection
  - Old Bath & Body Works, Body Care, and Home Fragrance entries → Bath & Body Works Collection
  - Old Fragrances, Men’s Collection, Gift Sets, Others, and uncategorized entries → Designer and Luxury Fragrances
- Subcategories still include mists, lotions, candles, hand soaps, sanitizers, men’s fragrances, oils, and gift sets.

Deployment note:
After uploading this update to GitHub, use Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
