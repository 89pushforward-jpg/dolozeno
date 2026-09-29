# DOLOŽENO 2.0 — production

The approved redesign is deployed by `.github/workflows/deploy-pages.yml` to GitHub Pages from `main`. Only `dist` is published. The custom domain remains `dolozeno.cz`; no DNS migration is needed.

## Editing and publishing

- `/admin.html` retains GitHub authentication and edits the original FEED in the repository's root `index.html`. This source file is not the public homepage. Do not replace it with generated HTML.
- A commit triggers the new build and Pages deployment. Deployment success, not the admin's save message, confirms publication.
- Six new topics are available in the admin. Existing topic overrides and article URLs are preserved.
- The publication date is interpreted in Europe/Prague. Future dates are scheduled, and years 2099 or later mean hidden, matching the original admin. Drafts, hidden and scheduled articles are excluded from production HTML, search, archive and sitemap.
- Scheduled builds run four times per hour. GitHub schedules can be delayed; this is not a guarantee of publication at the exact minute.
- Spis data is in `content/spisy.json` and `content/audio-spisy.json`, with description, publication date and HeroHero URL. Future-dated items remain hidden.
- Historical dialogue articles remain clearly marked as archive. Their substantive content and original URLs are retained; separate closing character commentary is omitted in the redesign.
- Vesmírná laboratoř sources remain in Git but are excluded from deployment and sitemap.

## Build and checks

```
npm run test:publication
npm run build:production
npm run test:production
```

Production pages use `index,follow`, self-canonical URLs, sitemap and structured metadata. Admin is `noindex`. `npm run build` generates a separate local preview with `noindex`; never deploy that build.

The original Google Apps Script endpoint is reused for analytics only, running on the production domain. The redesign has no newsletter form or email collection.

A replacement `sw.js` retires the old service worker and its `dolozeno` caches. Source images and original content stay in Git; no credentials are bundled.

## Rollback

The previous release is commit `0d7f0547c2dd37fc2caab2b0fc3985e30308cf30`, preserved by `backup/pre-dolozeno-2-20260930` and a local Git bundle outside the repository. Prefer reverting the deployment merge while preserving subsequent editorial commits. To return to the old hosting arrangement, restore that release and set Pages publishing to the `main` branch root. Do not reset or overwrite newer editorial data.

After deployment, check the real HTTPS homepage, representative article, missing-page 404, admin, robots and sitemap. Submit or inspect `https://dolozeno.cz/sitemap.xml` in Search Console with the owner's access. Sitemap inclusion does not guarantee Google indexing.
