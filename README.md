# IXP Homes

A Jacksonville-area home services, landscaping projects, inspection, and property care website. React, TypeScript, React Router, and Tailwind run in the browser. Vite prerenders every public page at build time. Express serves the files and handles lead delivery in a single Node.js process.

## Run locally

Use Node.js 24 and npm 11.

```bash
cd /home/hype/ixp-home
npm ci
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies the lead API and health check to Express on port 3001. To verify the production build locally, stop development mode and run:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). The production server reads `PORT` from its environment and serves a custom HTTP 404 for unknown page routes.

## Services and instant pricing

Update the public service list in [src/config/content.ts](src/config/content.ts) and the matching inquiry options in [shared/lead.mjs](shared/lead.mjs). Set the public tap-to-call number and display format in [src/config/business.ts](src/config/business.ts).

The [pricing configuration](src/config/pricing.ts) controls the card summaries, quote scopes, rates, quantity limits, cost notes, and pricing reference links. The business supplied the $177 starting figure for dryer vent cleaning. Rate cards for other services use published Jacksonville-area planning examples. Complex scopes go to the written quote form. A visitor can see a planning price before sharing contact details. Verify the pricing and the scope of work the business is authorized to advertise before publishing. Enter the applicable license in the business configuration when confirmed. [Florida DBPR licensing guide](https://www2.myfloridalicense.com/services-requiring-a-dbpr-license/)

## Configure lead notifications

1. Verify your sending domain in [Resend](https://resend.com/docs/dashboard/domains/introduction) and create a sending API key.
2. Set `RESEND_API_KEY` to the key, `LEADS_FROM_EMAIL` to an address on the verified sending domain, and `LEADS_TO_EMAIL` to the business inbox. Use bare email addresses for both email settings.
3. Keep local secrets in `.env` and deployed secrets in Heroku Config Vars. Restart the running app after changing the settings.
4. Submit a clearly labeled test inquiry using your own contact information and confirm that it arrives, then reply to verify the reply-to address.

With missing email configuration, the API returns an unavailable message and keeps entries available for retry. Provider errors also preserve entered information in the active form. Automated tests use synthetic submissions and intercepted delivery. There is no database or local lead archive. Rate limits are in memory per dyno. Analytics emit event names and the inquiry channel to an existing `dataLayer` and the browser’s `ixp:analytics` event. Add your analytics integration only if needed, and update the privacy policy to reflect how it works.

## Deploy to Heroku

With the Heroku CLI and a verified Heroku account, make the initial commit when the source is ready to deploy:

```bash
git add .
git commit -m "Build IXP Homes website"
heroku login
heroku create
heroku config:set TRUST_PROXY_HOPS=1
```

In the app’s **Settings → Config Vars** in the Heroku dashboard, add the three email settings above. Heroku supplies `PORT` and runs `heroku-postbuild` to build and prerender the site before it starts the Procfile web process.

```bash
git push heroku HEAD:main
heroku open /health
heroku domains:add www.ixphomes.com
heroku domains
```

Add the CNAME for `www` at your DNS provider using the DNS target from `heroku domains`. Enable [Automated Certificate Management](https://devcenter.heroku.com/articles/automated-certificate-management) on an eligible dyno and verify [https://www.ixphomes.com](https://www.ixphomes.com) after DNS and TLS are ready. See [Heroku’s Node.js deployment guide](https://devcenter.heroku.com/articles/deploying-nodejs) and [custom domains guide](https://devcenter.heroku.com/articles/custom-domains).

## Update photos, branding, and business details

- Put original photos in the matching folder under `public/images/`. In [src/config/images.ts](src/config/images.ts), update image paths, alt text, and captions. Responsive variants use widths of 640 px and 1280 px. To use a single file, omit the `small` property. Keep the before-and-after images framed alike, then update their descriptions and the comparison caption in [Comparison.tsx](src/components/Comparison.tsx). Update the illustrative imagery notices as real photos replace the examples.
- Logo variants live in [public/branding](public/branding). The header uses `logo-dark.svg`, the footer uses `logo-light.svg`, the popup uses `logo-compact.svg`, and the browser tab uses `favicon.svg`. Brand colors and type live in [src/styles/site.css](src/styles/site.css).
- Configure the verified public phone number, display label, and email address in [src/config/business.ts](src/config/business.ts). That file also controls the canonical origin, listed service areas, and optional homepage credentials. Add confirmed license and insurance details as applicable. The official BBB seal and its profile link are configured in [shared/bbb-seal.mjs](shared/bbb-seal.mjs). Review actual coverage, add confirmed business details as available, and review the Privacy Policy and Terms of Use against actual practices before launch.
- The demonstration images are original illustrative renders generated using OpenAI’s built-in image tool. The image briefs were a blue-hour coastal waterfront home, an inspection/pressure washing/upkeep editorial contact sheet, a matching stained-versus-cleaned paver entrance, and a technician cleaning a dryer exhaust vent, an editorial photo sheet of flooring, tile, painting, drywall repair, door installation, TV mounting, and trim carpentry, and a one-time landscape bed installation. They do not depict completed IXP Homes projects or an identified real property.

## Verify changes

```bash
npm run lint
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

API tests cover validation, spam protection, throttling, and successful, failed, and unconfigured delivery. Browser tests exercise navigation, crawlable HTML, the 404, estimate and chat submissions, popup dismissal, and the comparison slider on desktop and mobile.
