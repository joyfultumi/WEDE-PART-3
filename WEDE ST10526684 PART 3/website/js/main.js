// main.js
// Shared JavaScript loaded on every page:
// mobile menu, active nav link, footer year, back-to-top button,
// scroll animations, tabs, accordion and form-validation helpers.

document.addEventListener("DOMContentLoaded", function () {
    setUpMobileMenu();
    highlightCurrentPage();
    setFooterYear();
    setUpBackToTop();
    setUpScrollReveal();
    setUpTabs();
    setUpAccordion();
    showFeaturedProducts();
});

// ===== Mobile (hamburger) menu =====
function setUpMobileMenu() {
    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");
    if (!button || !nav) return;

    button.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("open");
        button.setAttribute("aria-expanded", isOpen);
        button.textContent = isOpen ? "✕" : "☰";
    });
}

// ===== Underline the link of the page the user is on =====
function highlightCurrentPage() {
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") currentPage = "index.html";

    document.querySelectorAll("nav a").forEach(function (link) {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

// ===== Keep the copyright year up to date =====
function setFooterYear() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

// ===== Back-to-top button (DOM element created with JavaScript) =====
function setUpBackToTop() {
    const button = document.createElement("button");
    button.id = "back-to-top";
    button.className = "button";
    button.type = "button";
    button.textContent = "↑ Top";
    button.setAttribute("aria-label", "Back to top of page");
    document.body.appendChild(button);

    window.addEventListener("scroll", function () {
        button.classList.toggle("visible", window.scrollY > 400);
    });

    button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ===== Fade sections in as they scroll into view =====
function setUpScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        items.forEach(function (item) { item.classList.add("visible"); });
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach(function (item) { observer.observe(item); });
}

// ===== Tabs (About page) =====
function setUpTabs() {
    document.querySelectorAll(".tabs").forEach(function (tabsBox) {
        const buttons = tabsBox.querySelectorAll('[role="tab"]');
        const panels = tabsBox.querySelectorAll('[role="tabpanel"]');

        buttons.forEach(function (button, index) {
            button.addEventListener("click", function () {
                buttons.forEach(function (b) {
                    b.setAttribute("aria-selected", "false");
                    b.setAttribute("tabindex", "-1");
                });
                panels.forEach(function (p) { p.hidden = true; });

                button.setAttribute("aria-selected", "true");
                button.removeAttribute("tabindex");
                panels[index].hidden = false;
            });

            // Left / right arrow keys move between tabs
            button.addEventListener("keydown", function (event) {
                let next = null;
                if (event.key === "ArrowRight") next = buttons[(index + 1) % buttons.length];
                if (event.key === "ArrowLeft") next = buttons[(index - 1 + buttons.length) % buttons.length];
                if (next) {
                    next.focus();
                    next.click();
                }
            });
        });
    });
}

// ===== Accordion (About page FAQ) =====
function setUpAccordion() {
    document.querySelectorAll(".accordion-item button").forEach(function (button) {
        button.addEventListener("click", function () {
            const item = button.closest(".accordion-item");
            const isOpen = item.classList.toggle("open");
            button.setAttribute("aria-expanded", isOpen);
        });
    });
}

// ===== Home page: build the "featured treats" cards from products.json =====
async function showFeaturedProducts() {
    const container = document.getElementById("featured-products");
    if (!container || typeof loadProducts === "undefined") return;

    container.setAttribute("aria-busy", "true");
    try {
        const products = await loadProducts();
        container.innerHTML = ""; // remove the "Loading…" message
        products.filter(function (p) { return p.featured; }).forEach(function (product) {
            container.appendChild(createProductCard(product, false));
        });
    } catch (error) {
        showLoadError(container, error);
    } finally {
        container.removeAttribute("aria-busy");
    }
}

// Creates one product card element. Used on the Home and Products pages.
// textContent is used (not innerHTML) so data is never run as HTML.
function createProductCard(product, clickableImage) {
    const card = document.createElement("article");
    card.className = "product-card";

    const img = document.createElement("img");
    img.src = "images/thumbs/" + product.image;
    img.alt = product.alt;
    img.width = 480;
    img.height = 360;
    img.loading = "lazy";

    if (clickableImage) {
        const imageButton = document.createElement("button");
        imageButton.type = "button";
        imageButton.className = "image-button";
        imageButton.setAttribute("aria-label", "View larger image of " + product.name);
        imageButton.dataset.id = product.id;
        imageButton.appendChild(img);
        card.appendChild(imageButton);
    } else {
        card.appendChild(img);
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const category = document.createElement("span");
    category.className = "category";
    category.textContent = product.category;

    const title = document.createElement("h3");
    title.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = formatRand(product.price) + " " + product.unit;

    // Link to the enquiry form with this product already chosen,
    // e.g. enquiry.html?product=red-velvet-cake
    const enquire = document.createElement("a");
    enquire.className = "button small";
    enquire.href = "enquiry.html?product=" + encodeURIComponent(product.id);
    enquire.textContent = "Enquire about this";
    enquire.setAttribute("aria-label", "Enquire about " + product.name);

    body.append(category, title, description, price, enquire);
    card.appendChild(body);
    return card;
}

// ===== Form validation helpers (used by enquiry.js and contact.js) =====

// Red border + message under the field
function showError(field, message) {
    const errorBox = document.getElementById(field.id + "-error");
    field.classList.remove("valid");
    field.classList.add("invalid");
    field.setAttribute("aria-invalid", "true");
    if (errorBox) errorBox.textContent = message;
}

function clearError(field) {
    const errorBox = document.getElementById(field.id + "-error");
    field.classList.remove("invalid", "valid");
    field.removeAttribute("aria-invalid");
    if (errorBox) errorBox.textContent = "";
}

// Green border for a correctly filled-in field (empty optional fields stay plain)
function markValid(field) {
    clearError(field);
    if (field.value.trim() !== "") field.classList.add("valid");
}

// The fields a form validates - the hidden spam-trap field is left out
function getFormFields(form) {
    return Array.from(form.querySelectorAll(".form-row input, .form-row select, .form-row textarea"));
}

// Validates every field with the page's rule function.
// Returns true if all are valid; otherwise shows the error summary.
function validateForm(form, validateField) {
    const invalidFields = getFormFields(form).filter(function (field) { return !validateField(field); });
    if (invalidFields.length === 0) {
        hideErrorSummary(form);
        return true;
    }
    showErrorSummary(form, invalidFields);
    return false;
}

// A box above the form listing every problem, each one a link to its field
function showErrorSummary(form, invalidFields) {
    let summary = document.getElementById(form.id + "-summary");
    if (!summary) {
        summary = document.createElement("div");
        summary.id = form.id + "-summary";
        summary.className = "error-summary";
        summary.setAttribute("role", "alert");
        summary.tabIndex = -1;
        form.before(summary);
    }
    summary.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = invalidFields.length === 1
        ? "Please fix 1 problem before sending:"
        : "Please fix " + invalidFields.length + " problems before sending:";

    const list = document.createElement("ul");
    invalidFields.forEach(function (field) {
        const label = form.querySelector('label[for="' + field.id + '"]');
        const error = document.getElementById(field.id + "-error");

        const link = document.createElement("a");
        link.href = "#" + field.id;
        link.textContent = label.textContent.replace(/\s*\*$/, "").replace(/\s*\(.*\)$/, "") + ": " + error.textContent;
        link.addEventListener("click", function (event) {
            event.preventDefault();
            field.focus();
        });

        const item = document.createElement("li");
        item.appendChild(link);
        list.appendChild(item);
    });

    summary.append(heading, list);
    summary.hidden = false;
    summary.focus();
}

function hideErrorSummary(form) {
    const summary = document.getElementById(form.id + "-summary");
    if (summary) summary.hidden = true;
}

// Spam protection: bots fill in the hidden "website" field and submit
// within a second or two. People never see the field and take longer.
const PAGE_OPENED_AT = Date.now();

function looksLikeSpam(form) {
    const trap = form.querySelector('input[name="website"]');
    const tooFast = Date.now() - PAGE_OPENED_AT < 2000;
    return (trap && trap.value !== "") || tooFast;
}

// Stops double submissions by disabling the button while working
function setSubmitting(form, isSubmitting, busyText) {
    const button = form.querySelector('button[type="submit"]');
    if (!button.dataset.label) button.dataset.label = button.textContent;
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? busyText : button.dataset.label;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// South African numbers: 0821234567 or +27821234567 (spaces allowed)
function isValidSAPhone(phone) {
    return /^(\+27|0)[1-9][0-9]{8}$/.test(phone.replace(/\s/g, ""));
}

// Letters (including accents), spaces, hyphens and apostrophes only
function isValidName(name) {
    return /^[A-Za-zÀ-ÿ' -]+$/.test(name);
}

// True if the text contains a web link (a common sign of spam)
function containsLink(text) {
    return /(https?:\/\/|www\.)/i.test(text);
}
