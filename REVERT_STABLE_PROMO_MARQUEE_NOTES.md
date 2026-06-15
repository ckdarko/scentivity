# Scentivity stable promo marquee restore

This patch reverts the broken V2 promo-marquee override and restores the moving promo strip on both pages.

## Upload these files

- `index.html`
- `product.html`
- `scentivity-mobile-promo-marquee-stable-20260615.css`
- `REVERT_STABLE_PROMO_MARQUEE_NOTES.md`

## Do not overwrite

- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded product images/videos

## Optional cleanup after testing

After confirming the moving promo works again, you may delete these old failed/unused promo CSS files from the repo root if present:

- `scentivity-mobile-promo-marquee-v2-20260615.css`
- `scentivity-mobile-promo-marquee-20260615.css`

This restore uses CSS-only transform animation. It does not add JavaScript, fetches, images, or video loading, so it should not hurt mobile opening speed.
