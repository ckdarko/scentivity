# Full Product Image Display Update

This update changes the product-card image styling so uploaded product photos are no longer cropped into a square.

## What changed

In `styles.css`, `.product-card img` was changed from:

```css
aspect-ratio: 1 / 1;
object-fit: cover;
```

to a full-image display using:

```css
height: auto;
max-height: 560px;
object-fit: contain;
```

## Result

Tall branded product images, such as Scentivity product photos with the logo and motto at the top, now show fully on the website instead of being cut off.

## Recommended image format

For best results, upload product images in portrait format, such as:

- 4:5
- 3:4
- 9:16

Avoid adding too much empty space around the product unless you want the card image to appear smaller.
