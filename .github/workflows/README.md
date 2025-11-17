# GitHub Actions Workflows

## Deploy Policies to GitHub Pages

This workflow automatically deploys the `policies` folder to GitHub Pages following the [official GitHub documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow).

### Setup Instructions

1. **Enable GitHub Pages with GitHub Actions:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Build and deployment**, under **Source**, select **GitHub Actions** (not "Deploy from a branch")
   - Save the settings
   - GitHub will automatically create a `github-pages` environment if it doesn't exist

2. **Push the workflow file:**
   - The workflow file is located at `.github/workflows/deploy-policies.yml`
   - Push it to your `main` or `master` branch

3. **Your privacy policy will be available at:**
   - `https://[your-username].github.io/[repository-name]/`
   - Or if using a custom domain: `https://yourdomain.com/`

### How It Works

Following the [GitHub Pages workflow pattern](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow):

1. **Trigger:** Workflow runs when:
   - Changes are pushed to `main` or `master` branch in the `policies/` folder
   - The workflow file itself is updated
   - Manually triggered from the Actions tab

2. **Checkout:** Uses `actions/checkout@v4` to check out repository contents

3. **Setup:** Uses `actions/configure-pages@v4` to configure GitHub Pages

4. **Build:** Copies the `policies/` folder contents to `_site/` directory

5. **Upload:** Uses `actions/upload-pages-artifact@v3` to upload static files as an artifact

6. **Deploy:** Uses `actions/deploy-pages@v4` to deploy the artifact to GitHub Pages

### Manual Trigger

You can manually trigger the deployment:
- Go to **Actions** tab in your repository
- Select **Deploy Policies to GitHub Pages** workflow
- Click **Run workflow** button

### Permissions

The workflow uses the following permissions (as required by GitHub):
- `contents: read` - To read repository contents
- `pages: write` - To write to GitHub Pages
- `id-token: write` - For OIDC authentication

### Notes

- The workflow follows the official GitHub Pages workflow pattern
- It uses the `github-pages` deployment environment
- Only one deployment runs at a time (concurrency control)
- Your privacy policy will be accessible at the root of your GitHub Pages site
- The workflow only triggers on changes to `policies/` folder to avoid unnecessary builds

### Troubleshooting

If the site doesn't deploy:
1. Check the **Actions** tab for workflow run status
2. Verify GitHub Pages is set to use **GitHub Actions** as the source
3. Ensure the `github-pages` environment exists (created automatically)
4. Check that files in `policies/` folder are valid HTML

