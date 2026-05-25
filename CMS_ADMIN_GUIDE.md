# Scentivity CMS Admin Guide

This version of the Scentivity website supports click-to-add product updates using Decap CMS + Netlify Identity + Git Gateway.

## What the admin page does

After deployment, go to:

```text
https://your-site-name.netlify.app/admin/
```

You can then:

- add a new perfume product
- upload a real product photo
- enter price, size, category, and scent notes
- mark a product available/unavailable
- publish changes without editing website files manually

## Files added for the CMS

```text
admin/index.html       Decap CMS admin app
admin/config.yml      CMS settings and product fields
data/products.json    Product catalog edited by the CMS
assets/products/uploads/  Uploaded product images go here
netlify.toml          Netlify publish settings
```

## Important

This click-to-add setup requires the website to be connected to a GitHub repository and deployed through Netlify. Netlify needs the GitHub connection so Decap CMS can save product changes back into your repository.

Do not use manual drag-and-drop deployment for this CMS version if you want product uploads to publish automatically.
