# Free Deployment and Hosting Steps for Scentivity

This is a static website, so it can be hosted for free on GitHub Pages, Netlify, or Vercel.

## Option 1: GitHub Pages

Best if you want a free website like:

```text
https://yourusername.github.io/scentivity
```

Steps:

1. Create a GitHub account or log in.
2. Create a new repository named `scentivity`.
3. Upload all website files into the repository. Make sure `index.html` is in the root folder.
4. Go to the repository's **Settings**.
5. Click **Pages** in the left menu.
6. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
7. Click **Save**.
8. Wait a few minutes and open the generated GitHub Pages link.

To update products later, edit `script.js`, commit the change, and GitHub Pages will update the site.

## Option 2: Netlify Drag-and-Drop

Best if you want the easiest upload process.

Steps:

1. Zip or keep the `scentivity_site` folder ready.
2. Go to Netlify Drop.
3. Drag and drop the folder into the upload area.
4. Netlify will publish the site and give you a free temporary URL.
5. Rename the site in Netlify settings if you want a cleaner free subdomain.

To update products later, drag and drop the updated folder again.

## Option 3: Vercel

Best if you want automatic deployments from GitHub.

Steps:

1. Push the `scentivity_site` files to a GitHub repository.
2. Log in to Vercel.
3. Choose **Add New Project**.
4. Import the GitHub repository.
5. For a plain HTML/CSS/JS website, keep the default settings.
6. Click **Deploy**.
7. Vercel will provide a free live URL.

To update products later, edit files in GitHub and push the changes. Vercel will redeploy automatically.

## Custom Domain

You can buy a domain such as:

```text
scentivity.com
shopscentivity.com
scentivityperfumes.com
```

Then connect it through GitHub Pages, Netlify, or Vercel domain settings.

## What to Update Before Going Live

- Real business contact details
- Real email address
- Real Instagram/TikTok/Facebook links
- Real product photos
- Real prices and sizes
- Delivery, pickup, and payment details
- Return/exchange policy
- Shipping locations
- Any legal business information required in your area

## Suggested Launch Checklist

- Test on phone and laptop
- Click every navigation link
- Test all order buttons
- Replace placeholder contact details
- Compress product photos for faster loading
- Ask two or three people to review the site before sharing publicly
