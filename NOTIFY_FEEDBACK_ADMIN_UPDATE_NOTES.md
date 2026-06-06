# Scentivity Notify Me and Pending Feedback Admin Update

Changes made:
1. Coming Soon / Notify Me now opens the Contact / Preorder popup and prefills the request with the product name.
2. Removed the text:
   - Customer feedback will appear here only after it has been reviewed and approved by Scentivity.
   - Approved customer feedback will appear here.
3. Fixed the customer feedback form so it does not open a 404/page-not-found page.
4. Added a Netlify Function: `netlify/functions/submit-feedback.js`.
5. Added `data/pending-feedback.json`.
6. Added a new `/admin` section called **Pending Customer Feedback**.

Important setup for automatic pending feedback in /admin:
To make customer-submitted feedback automatically appear in `/admin → Pending Customer Feedback`, add these Netlify environment variables:

- `GITHUB_TOKEN`: GitHub fine-grained token with Contents: Read and write access to this repository
- `GITHUB_REPO`: owner/repo, for example `yourusername/your-repo-name`
- `GITHUB_BRANCH`: `main`

Without these variables, the form will still thank the customer, but it cannot write the feedback into the admin queue automatically.
