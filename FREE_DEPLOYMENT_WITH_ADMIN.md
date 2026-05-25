# Free Deployment + Click-to-Add Products for Scentivity

## Recommended free stack

- GitHub: stores the website files
- Netlify: hosts the website for free
- Decap CMS: provides `/admin` where you can add products with clicks
- Netlify Identity + Git Gateway: lets the admin page save changes to GitHub

## Step 1 — Upload files to GitHub

1. Create a free GitHub account.
2. Create a new public repository named `scentivity-website`.
3. Upload the website files from this folder. Upload the contents of this folder, not the ZIP file itself.
4. Confirm these files are visible in the root of the repository:

```text
index.html
styles.css
script.js
admin/
data/
assets/
netlify.toml
```

## Step 2 — Deploy from GitHub to Netlify

1. Create a free Netlify account.
2. Choose **Add new project**.
3. Select **Import an existing project**.
4. Connect GitHub.
5. Select the `scentivity-website` repository.
6. For build settings:
   - Build command: leave blank
   - Publish directory: `.`
7. Click **Deploy**.

## Step 3 — Enable Identity

1. In Netlify, open the Scentivity site dashboard.
2. Go to **Project configuration** or **Site configuration**.
3. Open **Identity**.
4. Enable Netlify Identity.
5. Set registration to **Invite only** for safety.

## Step 4 — Enable Git Gateway

1. In the same Identity area, find **Services**.
2. Enable **Git Gateway**.
3. Leave roles blank unless you want role-based restrictions.

## Step 5 — Invite yourself as admin

1. Go to **Identity > Users**.
2. Click **Invite users**.
3. Enter your email address.
4. Open the invitation email.
5. Create your password.

## Step 6 — Add products from the website

1. Go to:

```text
https://your-site-name.netlify.app/admin/
```

2. Log in.
3. Open **Scentivity Store**.
4. Open **Products**.
5. Click **Add Product**.
6. Upload a perfume photo.
7. Enter name, category, price, size, scent notes, and availability.
8. Click **Publish**.

Netlify will rebuild/redeploy the site automatically after the CMS saves the product change to GitHub.

## Updating later

Use `/admin/` for product updates. Use GitHub only for deeper design changes such as colors, layout, contact details, or logo replacement.
