# Joyful Delights Bakery – Website

**Student:** ST10526684
**Module:** WEDE5020 – Web Development (Introduction)
**POE Part:** Part 3 – Enhancing Functionality and SEO
**Live site:** https://YOUR-USERNAME.github.io/joyful-delights-bakery/
**Repository:** https://github.com/YOUR-USERNAME/joyful-delights-bakery

---

## 1. Project overview

Joyful Delights Bakery is a family bakery in Nietgedacht, Gauteng (founded 2015) that sells fresh cakes, cupcakes, muffins, scones and treats. The website lets customers browse products, get an instant quote for orders, and contact the bakery.

### Goals
- Show customers the full product range with prices and photos.
- Let customers request quotes for custom and bulk orders online.
- Make the bakery easy to find on search engines and on a map.

### Target audience
Local families, schools, offices and event planners in Nietgedacht, Lanseria and the surrounding area.

---

## 2. Site structure

```
/
├── index.html          Home – hero, featured products, why choose us, opening hours
├── about.html          About – story/mission/vision tabs, FAQ accordion
├── products.html       Products – searchable, filterable product list + lightbox gallery
├── enquiry.html        Enquiry – order quote form with cost & availability response
├── contact.html        Contact – details, email contact form, interactive map
├── robots.txt          Instructions for search engine crawlers
├── sitemap.xml         List of pages for search engines
├── css/style.css       All styles (including responsive design and animations)
├── js/
│   ├── products-data.js  Product list used by several pages
│   ├── main.js           Shared code: menu, tabs, accordion, animations, validation helpers
│   ├── products.js       Product search / filter / sort and lightbox
│   ├── enquiry.js        Enquiry form validation, quote and AJAX submission
│   └── contact.js        Contact form validation, email compiling and Leaflet map
└── images/
    ├── *.jpeg            Full-size photos (used in the lightbox)
    └── thumbs/*.jpeg     Small compressed copies (used on cards for faster loading)
```

---

## 3. Part 3 features

### 3.1 Interactive elements (JavaScript)
| Feature | Page | How it works |
|---|---|---|
| Tabs | About | Story / Mission / Vision tabs; keyboard arrow keys supported (`main.js` → `setUpTabs`) |
| Accordion | About | FAQ questions open and close (`main.js` → `setUpAccordion`) |
| Lightbox / modal gallery | Products | Click a photo to see it full size; next/previous buttons, arrow keys and Esc (`products.js`) |
| Interactive map | Contact | Leaflet + OpenStreetMap map with marker, popup, 10 km delivery circle and "centre map" button (`contact.js`) |
| Mobile menu | All | Hamburger button shows/hides the menu on small screens |
| Back-to-top button | All | Created with JavaScript, appears after scrolling |

### 3.2 Animations and transitions
- Hero section fades and slides in on page load (CSS `@keyframes`).
- Sections fade in as you scroll (JavaScript `IntersectionObserver` + CSS transition).
- Product cards lift on hover; buttons and nav links animate on hover.
- Lightbox fades and zooms in.
- All animations are switched off for users who turn on "reduce motion" on their device.

### 3.3 Dynamic content and DOM manipulation
- Products are stored once in `js/products-data.js` and the cards are **built with JavaScript** (`createElement`, `textContent`, `appendChild`).
- Home page "Customer Favourites" are loaded from the same data.
- Enquiry page product dropdown and Products page category dropdown are filled from the data.
- **Search, filter and sort** on the Products page update the list as you type.

### 3.4 Forms
**enquiry.html – order enquiry**
- Fields: name, email, phone, enquiry type, product, quantity, date needed, extra details.
- JavaScript validation with an error message under each field (name letters only, valid email, South African phone number, quantity 1–200, date at least 2 days ahead).
- After validation the page shows a **response with the estimated cost** (price × quantity, 10% discount for 24+ items) and **availability** (closed on Sundays; large orders flagged for a phone call).
- Data is sent with **AJAX** (`fetch`) to Formspree, so the page does not reload.

**contact.html – general message**
- Fields: name, email, phone (optional), type of message, subject, message (with live character counter).
- JavaScript validation with error messages.
- Valid data is **compiled into an email** (subject and body) and the user's email app opens addressed to `info@joyfuldelightsbakery.com`.

### 3.5 SEO
**On-page**
- Unique `<title>` and `<meta name="description">` on every page, using keywords such as *bakery Nietgedacht, custom cakes, cupcakes, muffins, scones*.
- One `<h1>` per page, followed by `<h2>` and `<h3>` in order.
- Descriptive image file names (e.g. `mothers-day-cakes.jpeg` instead of `WhatsApp Image...jpeg`) and `alt` text on every image.
- Clean, descriptive URLs (`products.html`, `enquiry.html`, ...).
- Internal links in the content and footer between related pages.
- Mobile-friendly responsive layout (viewport meta tag, media queries, hamburger menu).
- Canonical links and Open Graph tags for social sharing.

**Off-page / local**
- Footer links to social media pages.
- `Bakery` structured data (schema.org JSON-LD) with address, phone and opening hours for local search.
- Address and phone shown on every page.

**Technical**
- `robots.txt` allows crawling and points to the sitemap.
- `sitemap.xml` lists all pages.
- **Page speed:** compressed thumbnails (about 50 KB each instead of up to 280 KB), `loading="lazy"` on images, `width`/`height` set to avoid layout shift, scripts loaded with `defer`.
- **Security:** Content Security Policy meta tag (only allows scripts from this site and the Leaflet library), Subresource Integrity (`integrity`) on the Leaflet files, `rel="noopener noreferrer"` on external links, user input added to the page with `textContent` (never `innerHTML`) to prevent script injection, HTTPS through GitHub Pages.

---

## 4. How to run locally
Open `index.html` in a browser, or in VS Code right-click `index.html` → **Open with Live Server**.

---

## 5. Changelog

### Part 3 – fixes based on Part 2 feedback
| Date | File(s) | Change |
|---|---|---|
| 2026-11-02 | index.html | Removed the duplicate `</body>` tag; the footer was outside `<body>` and is now inside it. |
| 2026-11-02 | index.html | Removed inline styles (`style="background-color..."` on body and `style="width..."` on the logo) and moved them to `style.css`. |
| 2026-11-02 | All pages | Added the logo to the header of every page (before, only the Home page had it) so the branding is consistent. |
| 2026-11-02 | All pages | Each page now has its own `<h1>`; the site name in the header is a link instead of a repeated `<h1>`. |
| 2026-11-02 | products.html | The image `<div>` was inside a `<ul>`, which is invalid HTML. Products are now cards inside a grid. |
| 2026-11-02 | products.html | Added `alt` text to every product image (none had it before). |
| 2026-11-02 | products.html | Added names, descriptions and prices to each product photo. |
| 2026-11-02 | contact.html | Replaced the placeholder Google Maps embed (it pointed to a made-up address in the USA) with a working Leaflet map of the bakery. |
| 2026-11-02 | contact.html | Fixed address spelling and capitalisation: "21701 Badger Street, Nietgedacht, 1739". Made phone and email clickable. |
| 2026-11-02 | All pages | Footer year changed from "2015" to the current year (set by JavaScript). |
| 2026-11-02 | style.css | White nav links on a light pink background were hard to read. Changed them to dark purple and added a hover/active underline. |
| 2026-11-02 | style.css | Removed unused classes (`.green-text`, `#red-text`) and grouped colours into CSS variables. |
| 2026-11-02 | Folders | Organised files into `css/`, `js/` and `images/` folders. |
| 2026-11-02 | images | Renamed `WhatsApp Image 2026-08-20 at 13.39.50 (1).jpeg` to `mothers-day-cakes.jpeg` and added it to the products. |

> Note: add or edit rows so they match the exact comments your lecturer gave you for Part 2.

### Part 3 – new features
| Date | File(s) | Change |
|---|---|---|
| 2026-11-02 | js/products-data.js | Created one product list (name, category, price, image, alt text) used by all pages. |
| 2026-11-02 | products.html, js/products.js | Product cards are now loaded with JavaScript. Added search, category filter and sort by name/price. |
| 2026-11-02 | products.html, js/products.js | Added a lightbox gallery with next/previous, keyboard and click-outside-to-close support. |
| 2026-11-02 | index.html, js/main.js | Added "Customer Favourites" section loaded from the product data, "Why choose us" and opening hours. |
| 2026-11-02 | about.html, js/main.js | Added tabs (Story / Mission / Vision) and an FAQ accordion. |
| 2026-11-02 | enquiry.html, js/enquiry.js | Rebuilt the enquiry form with phone, enquiry type, product, quantity and date fields; JavaScript validation; cost and availability response; AJAX submission. |
| 2026-11-02 | contact.html, js/contact.js | New contact form with message type and subject; JavaScript validation; compiles the message into an email to the bakery. |
| 2026-11-02 | contact.html, js/contact.js | Added interactive Leaflet map with marker, popup and delivery-area circle. |
| 2026-11-02 | style.css, js/main.js | Added animations: hero fade-in, scroll reveal, card hover, lightbox zoom; reduced-motion support. |
| 2026-11-02 | All pages, js/main.js | Added hamburger menu for mobile and back-to-top button. |
| 2026-11-02 | All pages | SEO: unique titles, meta descriptions, keywords, canonical and Open Graph tags; structured data on Home and Contact. |
| 2026-11-02 | robots.txt, sitemap.xml | Created both files for search engines. |
| 2026-11-02 | images/thumbs | Created compressed thumbnails for faster loading; added lazy loading. |
| 2026-11-02 | All pages | Security: Content Security Policy, Subresource Integrity on Leaflet, `noopener` on external links. |
| 2026-11-02 | — | Deployed the website to GitHub Pages. |

---

## 6. References

Formspree (2026) *Formspree documentation: AJAX submissions*. Available at: https://help.formspree.io/hc/en-us/articles/360013470814-Submit-forms-with-JavaScript-AJAX (Accessed: 2 November 2026).

GitHub (2026) *Creating a GitHub Pages site*. Available at: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site (Accessed: 2 November 2026).

Google (2026) *SEO Starter Guide*. Google Search Central. Available at: https://developers.google.com/search/docs/fundamentals/seo-starter-guide (Accessed: 2 November 2026).

Google (2026) *Introduction to robots.txt*. Google Search Central. Available at: https://developers.google.com/search/docs/crawling-indexing/robots/intro (Accessed: 2 November 2026).

Google (2026) *Local business (LocalBusiness) structured data*. Google Search Central. Available at: https://developers.google.com/search/docs/appearance/structured-data/local-business (Accessed: 2 November 2026).

Leaflet (2023) *Leaflet Quick Start Guide*. Available at: https://leafletjs.com/examples/quick-start/ (Accessed: 2 November 2026).

MDN Web Docs (2026) *Client-side form validation*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation (Accessed: 2 November 2026).

MDN Web Docs (2026) *Using the Fetch API*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: 2 November 2026).

MDN Web Docs (2026) *Intersection Observer API*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API (Accessed: 2 November 2026).

MDN Web Docs (2026) *Content Security Policy (CSP)*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP (Accessed: 2 November 2026).

OpenStreetMap contributors (2026) *OpenStreetMap*. Available at: https://www.openstreetmap.org/copyright (Accessed: 2 November 2026).

Schema.org (2026) *Bakery*. Available at: https://schema.org/Bakery (Accessed: 2 November 2026).

Sitemaps.org (2016) *Sitemaps XML format*. Available at: https://www.sitemaps.org/protocol.html (Accessed: 2 November 2026).

W3C (2024) *ARIA Authoring Practices Guide: Tabs pattern and Accordion pattern*. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/ (Accessed: 2 November 2026).

> Keep your Part 1 and Part 2 references above or below this list as well.
