# Homepage Product Slideshow Update

Changes made:
- Added a homepage slideshow after the hero section.
- The slideshow shows available products first, then incoming / coming soon products.
- Products marked `Available: true` in the admin dashboard show as **Available now**.
- Products marked `Available: false` in the admin dashboard show as **Coming soon**.
- If no coming-soon products exist yet, the slideshow displays branded coming-soon placeholder slides.
- Available slideshow products include an **Add to Cart** button.
- Coming-soon slideshow products include a **Notify me** button that links to the preorder form.
- Added cache-busting to the script file.

Admin tip:
To add an incoming product, go to `/admin`, add the product image/details, and turn **Available** off before publishing.
