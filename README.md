# Omni: launch package

A static website: 3,797 pages, no server code, no database, no cookies.
Every country and category has its own address (for example `/italy/economy/`)
with its own title, description and crawlable tables, and the interactive app loads on top.

## 1. Set your domain
The pages use `https://www.example.com` as a placeholder in canonical links, the sitemap and share tags.
From inside this folder run:

    python3 set_domain.py https://www.yourdomain.com

## 2. Upload (pick one, all have free plans)
- **Cloudflare Pages:** Workers & Pages → Create → Pages → Upload assets → drag this folder.
- **Netlify:** app.netlify.com/drop → drag this folder.
- **GitHub Pages / any web host:** upload the folder's contents to the web root.

`404.html` is used automatically by Cloudflare Pages, Netlify and GitHub Pages.
`_headers` sets caching on Cloudflare Pages and Netlify (ignored elsewhere).

## 3. After it is live
- Connect your domain in the host's dashboard (HTTPS is automatic).
- Google Search Console: add the domain, then submit `https://www.yourdomain.com/sitemap.xml`.
- Bing Webmaster Tools: import from Search Console.

## Privacy
No cookies, no analytics, no third-party requests: fonts and libraries are self-hosted.
If you later add analytics or ads, you will need a cookie notice and to update the privacy note on `/about/`.

## Data sources and licences (credited on /about/)
UN World Population Prospects 2024 (CC BY 3.0 IGO) · World Bank WDI, October 2026 (CC BY 4.0) ·
Ember via Our World in Data (CC BY 4.0) · IMF WEO · CIA World Factbook · GeoNames (CC BY 4.0) ·
Natural Earth (public domain) · flag-icons (MIT) · Chart.js, d3-geo, topojson-client (MIT/ISC) ·
Fredoka, IBM Plex (SIL Open Font License).
