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
├── products.json       Product data (names, prices, images) loaded with fetch()
├── css/style.css       All styles (including responsive design and animations)
├── js/
│   ├── products-data.js  Loads products.json (loadProducts) and shows load errors
│   ├── main.js           Shared code: menu, tabs, accordion, animations, validation helpers
│   ├── reviews.js        Customer reviews carousel (jQuery)
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
| Interactive map | Contact | Leaflet + OpenStreetMap map with the bakery marker, two delivery-zone circles (free up to 10 km, R50 up to 25 km) and a "centre map" button (`contact.js` → `setUpMap`) |
| Location-based delivery checker | Contact | Customers check their delivery cost 3 ways: **Use my location** (browser Geolocation API), **search a suburb** (OpenStreetMap Nominatim, loaded with `fetch`), or **click the map**. The site measures the distance with the Haversine formula (`distanceInKm`), draws the customer's point and a dashed line to the bakery, and shows free / R50 / collection only. Friendly messages appear if location access is blocked or a place isn't found |
| Get directions | Contact | Opens Google Maps directions to the bakery. After a location check, the link starts from the customer's location |
| Reviews carousel (jQuery) | Home | Customer reviews fade in and out every 6 seconds; previous/next, dot buttons, Pause/Play, arrow keys; pauses on hover and focus (`reviews.js`) |
| Mobile menu | All | Hamburger button shows/hides the menu on small screens |
| Back-to-top button | All | Created with JavaScript, appears after scrolling |

#### Why jQuery for the carousel, and plain JavaScript everywhere else
The brief suggests jQuery or another JavaScript framework. I compared the two for each feature:

- **jQuery** is used for the reviews carousel because the carousel needs fade animations. jQuery's `fadeIn()` and `fadeOut()` (with a callback that runs when the fade ends) and `stop()` handle the timing in a few lines. Its short syntax for building elements (`$("<p>").text(...)`) and attaching events (`.on("click", ...)`) keeps the code readable.
- **Plain (vanilla) JavaScript** is used for everything else (tabs, accordion, lightbox, search, forms, map) because modern browsers now include everything those features need (`querySelector`, `classList`, `fetch`, `IntersectionObserver`). Loading jQuery on every page would add about 30 KB that those pages don't need, so jQuery is only loaded on the Home page.
- jQuery is loaded from the official jQuery CDN with an `integrity` hash (Subresource Integrity), so the browser refuses the file if it was changed. The Home page's Content Security Policy allows `code.jquery.com` only.
- Accessibility: the carousel has a Pause button (WCAG 2.2.2 requires one for content that moves on its own), labels on every button, `aria-live` so screen readers announce new reviews, and it does not auto-play for users who turn on "reduce motion".

### 3.2 Animations and transitions
- Hero section fades and slides in on page load (CSS `@keyframes`).
- Sections fade in as you scroll (JavaScript `IntersectionObserver` + CSS transition).
- Product cards lift on hover; buttons and nav links animate on hover.
- Lightbox fades and zooms in.
- All animations are switched off for users who turn on "reduce motion" on their device.

### 3.3 Dynamic content and DOM manipulation
- Products are stored once in **`products.json`** and **loaded dynamically with `fetch()`** (AJAX, using `async`/`await`) when a page opens. The cards are then **built with JavaScript** (`createElement`, `textContent`, `appendChild`).
- `loadProducts()` in `js/products-data.js` remembers the request, so each page downloads the file only once even when several parts of the page need it.
- While loading, the page shows "Loading products…" and disables the search, filter and sort controls. If the file can't be loaded, a friendly error appears with a link to the Contact page, and the Enquiry form tells the customer to phone instead of failing silently.
- To change a price or add a product, the bakery only edits `products.json` – no code changes are needed.
- Note: browsers block `fetch()` for files opened by double-clicking, so run the site with Live Server or view the live website.
- Home page "Customer Favourites" are loaded from the same data.
- Enquiry page product dropdown and Products page category dropdown are filled from the data.
- **Search, filter and sort** on the Products page update the list as you type.
- **Filters are saved in the web address** (e.g. `products.html?category=Cakes&sort=price-low&q=red`) with `URLSearchParams` and `history.replaceState`, so a filtered view can be bookmarked or shared and survives a page refresh. Unknown values in the address are ignored.
- **"Enquire about this" button on every product card** opens `enquiry.html?product=<id>`. The Enquiry page reads the product from the address, selects it in the dropdown, and changes the page heading and title to "Enquire about Red Velvet Cake" (for example). Only product IDs that exist in `products.json` are accepted.
- The Home page links straight to the cake category (`products.html?category=Cakes`).

### 3.4 Forms
**enquiry.html – order enquiry**
- Fields: name, email, phone, enquiry type, product, quantity, date needed, extra details (with live character counter).
- After validation the page shows a **response with the estimated cost** (price × quantity, 10% discount for 24+ items) and **availability** (large orders flagged for a phone call).
- Data is sent with **AJAX** (`fetch`) to Formspree, so the page does not reload.

**contact.html – general message**
- Fields: name, email, phone, type of message, subject, message (with live character counter).
- Valid data is **compiled into an email** (subject and body) and the user's email app opens addressed to `info@joyfuldelightsbakery.com`.

#### JavaScript validation (both forms)
The forms use `novalidate`, so the browser's own pop-ups are switched off and JavaScript shows clear messages in the bakery's style. The HTML5 attributes (`required`, `type="email"`, `min`, `max`, `maxlength`, `pattern`) stay in the HTML as a backup.

**How it behaves**
- Each field is checked when the user leaves it, and re-checked on every key press while it is being fixed.
- A problem gives the field a **red border with a message under it**; a correct field gets a **green border**.
- On Submit, a **summary box above the form** lists every problem ("Please fix 3 problems before sending:"). Each item is a link that jumps to its field, and the box receives focus so screen readers announce it (`role="alert"`).
- **Conditional rules** change with the user's choices, and the affected fields are re-checked immediately when the choice changes.
- The submit button is **disabled while sending** ("Sending…") so a double click can't send twice.
- **Spam protection:** a hidden "honeypot" field (bots fill it in, people never see it) and a check that the form wasn't submitted within 2 seconds of the page opening. Spam is quietly ignored.

**Enquiry form rules**
| Field | Rules |
|---|---|
| Full name | Required; letters, spaces, hyphens and apostrophes only; first name **and** surname |
| Email | Required; valid format (`name@example.com`) |
| Phone | Required; South African number (`082 123 4567` or `+27 82 123 4567`) |
| Enquiry type, Product | Must be chosen |
| Quantity | Whole number 1–200; **bulk orders need at least 24** |
| Date needed | At least 2 days ahead; **catering needs 7 days**; no more than 6 months ahead; **no Sundays** (checked as soon as a date is picked) |
| Extra details | Max 500 characters; no web links; **required (15+ characters) for custom cake orders**, and its label changes to "Describe your cake *" |

**Contact form rules**
| Field | Rules |
|---|---|
| Name | Required; at least 2 letters; letters, spaces, hyphens and apostrophes only |
| Email | Required; valid format |
| Phone | Optional, but **required for complaints** (label changes to "Phone * (so we can call you back)"); must be a valid SA number if given |
| Type of message | Must be chosen |
| Subject | 3–80 characters; must contain letters; not ALL CAPITALS |
| Message | 20–1000 characters (shows how many typed so far); no web links |

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
| 2026-11-02 | js/main.js, js/enquiry.js, js/contact.js, enquiry.html, contact.html, css/style.css | Strengthened JavaScript validation on both forms: error summary with links to each field, green borders for valid fields, conditional rules (bulk orders 24+, catering 7 days' notice, custom cakes need a description, complaints need a phone number), Sundays and dates over 6 months ahead rejected as soon as they're picked, full name needs a surname, no web links, no all-caps subjects, live character counters, submit button disabled while sending, and honeypot + timing spam protection. Shared helpers (`validateForm`, `showErrorSummary`, `markValid`, `looksLikeSpam`, `setSubmitting`) moved into `main.js` so both forms use the same code. An old estimate is hidden when the form is resubmitted with errors. |
| 2026-11-02 | js/main.js, js/enquiry.js, enquiry.html, css/style.css | Added an "Enquire about this" button to every product card. It opens the Enquiry page with that product already selected and the heading and page title changed to match. |
| 2026-11-02 | js/products.js, index.html | Search, category and sort are now saved in the web address so filtered views can be shared, bookmarked and refreshed. Home page links to the Cakes category. |
| 2026-11-02 | products.json, js/products-data.js, js/main.js, js/products.js, js/enquiry.js, index.html, products.html, enquiry.html, css/style.css | Moved the product list out of JavaScript into `products.json` and load it with `fetch()` (`async`/`await`) on the Home, Products and Enquiry pages. Added "Loading…" messages, disabled controls until the data arrives, and friendly error messages if the file can't be loaded. |
| 2026-11-02 | products.html, js/products.js | Product cards are now loaded with JavaScript. Added search, category filter and sort by name/price. |
| 2026-11-02 | products.html, js/products.js | Added a lightbox gallery with next/previous, keyboard and click-outside-to-close support. |
| 2026-11-02 | index.html, js/reviews.js, css/style.css | Added a customer reviews carousel built with jQuery 3.7.1 (fade transitions, previous/next, dots, Pause/Play, keyboard support, pauses on hover/focus, respects reduced motion). jQuery is loaded from the official CDN with Subresource Integrity, and `code.jquery.com` was added to the Home page's Content Security Policy. |
| 2026-11-02 | index.html, js/main.js | Added "Customer Favourites" section loaded from the product data, "Why choose us" and opening hours. |
| 2026-11-02 | about.html, js/main.js | Added tabs (Story / Mission / Vision) and an FAQ accordion. |
| 2026-11-02 | enquiry.html, js/enquiry.js | Rebuilt the enquiry form with phone, enquiry type, product, quantity and date fields; JavaScript validation; cost and availability response; AJAX submission. |
| 2026-11-02 | contact.html, js/contact.js | New contact form with message type and subject; JavaScript validation; compiles the message into an email to the bakery. |
| 2026-11-02 | js/contact.js | After "Send Email" the form shows a success message and clears all fields (and the character counter) ready for a new message. |
| 2026-11-02 | contact.html, js/contact.js, css/style.css | Added location-based features to the map: a delivery checker (device location, suburb search or map click), Haversine distance calculation, a second delivery zone (R50 up to 25 km), the customer's marker with a line to the bakery, and a "Get directions" link that uses the customer's location. The place name is added to the map with `textContent` so search results can't inject HTML. `nominatim.openstreetmap.org` was added to the Contact page's Content Security Policy. |
| 2026-11-02 | about.html | Delivery FAQ updated with both delivery zones and a link straight to the delivery checker. |
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

jQuery Foundation (2026) *jQuery API Documentation: .fadeIn(), .fadeOut(), .on()*. Available at: https://api.jquery.com/ (Accessed: 2 November 2026).

Leaflet (2023) *Leaflet Quick Start Guide*. Available at: https://leafletjs.com/examples/quick-start/ (Accessed: 2 November 2026).

MDN Web Docs (2026) *Client-side form validation*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation (Accessed: 2 November 2026).

MDN Web Docs (2026) *Using the Fetch API*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: 2 November 2026).

MDN Web Docs (2026) *Geolocation API*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API (Accessed: 2 November 2026).

OpenStreetMap Foundation (2026) *Nominatim search API*. Available at: https://nominatim.org/release-docs/latest/api/Search/ (Accessed: 2 November 2026).

Google (2026) *Maps URLs: Directions*. Google for Developers. Available at: https://developers.google.com/maps/documentation/urls/get-started#directions-action (Accessed: 2 November 2026).

Movable Type Scripts (2022) *Calculate distance, bearing and more between latitude/longitude points (Haversine formula)*. Available at: https://www.movable-type.co.uk/scripts/latlong.html (Accessed: 2 November 2026).

MDN Web Docs (2026) *URLSearchParams*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams (Accessed: 2 November 2026).

MDN Web Docs (2026) *History: replaceState() method*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState (Accessed: 2 November 2026).

MDN Web Docs (2026) *async function*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function (Accessed: 2 November 2026).

MDN Web Docs (2026) *Working with JSON*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON (Accessed: 2 November 2026).

MDN Web Docs (2026) *Intersection Observer API*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API (Accessed: 2 November 2026).

MDN Web Docs (2026) *Content Security Policy (CSP)*. Mozilla. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP (Accessed: 2 November 2026).

OpenStreetMap contributors (2026) *OpenStreetMap*. Available at: https://www.openstreetmap.org/copyright (Accessed: 2 November 2026).

Schema.org (2026) *Bakery*. Available at: https://schema.org/Bakery (Accessed: 2 November 2026).

Sitemaps.org (2016) *Sitemaps XML format*. Available at: https://www.sitemaps.org/protocol.html (Accessed: 2 November 2026).

W3C (2024) *ARIA Authoring Practices Guide: Tabs, Accordion and Carousel patterns*. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/ (Accessed: 2 November 2026).

W3C (2024) *Tutorial: Forms – Validating Input and User Notifications*. Web Accessibility Initiative. Available at: https://www.w3.org/WAI/tutorials/forms/notifications/ (Accessed: 2 November 2026).

OWASP (2024) *Input Validation Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html (Accessed: 2 November 2026).

W3C (2023) *Understanding Success Criterion 2.2.2: Pause, Stop, Hide*. Available at: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html (Accessed: 2 November 2026).

> Keep your Part 1 and Part 2 references above or below this list as well.
