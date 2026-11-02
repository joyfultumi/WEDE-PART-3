// enquiry.js
// Enquiry page: validates the form with JavaScript, works out an estimated
// cost and availability, shows it to the user, and sends the form with AJAX.

const NOTICE_DAYS = 2;          // orders need at least 2 days' notice
const CATERING_NOTICE_DAYS = 7; // event catering needs a week
const MAX_MONTHS_AHEAD = 6;     // we take orders up to 6 months ahead
const BULK_QUANTITY = 24;       // 24 or more items gets a discount
const BULK_DISCOUNT = 0.10;     // 10% discount
const MAX_QUANTITY = 200;
const MIN_CUSTOM_DETAILS = 15;  // custom cakes need a short description

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("enquiry-form");
    const productSelect = document.getElementById("product");
    const dateInput = document.getElementById("date-needed");
    const responseBox = document.getElementById("enquiry-response");
    let products = [];

    fillProductDropdown();

    // Load the products from products.json and fill the dropdown
    async function fillProductDropdown() {
        const placeholder = productSelect.options[0];
        placeholder.textContent = "Loading products…";
        productSelect.disabled = true;

        try {
            products = await loadProducts();
            products.forEach(function (product) {
                const option = document.createElement("option");
                option.value = product.id;
                option.textContent = product.name + " (" + formatRand(product.price) + " " + product.unit + ")";
                productSelect.appendChild(option);
            });
            placeholder.textContent = "-- Please choose --";
            productSelect.disabled = false;
            preselectFromLink();
        } catch (error) {
            console.error(error);
            placeholder.textContent = "Products could not be loaded";
            showError(productSelect, "Our product list couldn't be loaded. Please refresh the page or phone us on 076 258 5159.");
        }
    }

    // If the user came from an "Enquire about this" button the address looks
    // like enquiry.html?product=red-velvet-cake - choose that product for them
    function preselectFromLink() {
        const productId = new URLSearchParams(window.location.search).get("product");
        const product = products.find(function (p) { return p.id === productId; });
        if (!product) return; // no product in the link, or an unknown one

        productSelect.value = product.id;
        const hint = document.getElementById("product-hint");
        hint.textContent = "You chose " + product.name + " on our products page. You can change it here.";

        const heading = document.querySelector("main h1");
        heading.textContent = "Enquire about " + product.name;
        document.title = "Enquire about " + product.name + " | Joyful Delights Bakery";
    }

    // Keep the hint correct if the user picks another product
    productSelect.addEventListener("change", function () {
        document.getElementById("product-hint").textContent = "";
    });

    // Earliest and latest dates that can be picked
    dateInput.min = toInputDate(addDays(new Date(), NOTICE_DAYS));
    const latest = new Date();
    latest.setMonth(latest.getMonth() + MAX_MONTHS_AHEAD);
    if (latest.getDay() === 0) latest.setDate(latest.getDate() - 1); // never suggest a Sunday
    dateInput.max = toInputDate(latest);

    const typeSelect = document.getElementById("enquiry-type");
    const messageBox = document.getElementById("message");
    const messageLabel = document.querySelector('label[for="message"]');
    const messageCounter = document.getElementById("message-count");

    // Check a field when the user leaves it, and again while they fix it
    getFormFields(form).forEach(function (field) {
        field.addEventListener("blur", function () {
            if (field.value.trim() !== "" || field.classList.contains("invalid")) validateField(field);
        });
        field.addEventListener("input", function () {
            if (field.classList.contains("invalid") || field.classList.contains("valid")) validateField(field);
        });
    });

    // Dates are checked as soon as one is picked, so Sundays are caught straight away
    dateInput.addEventListener("change", function () { validateField(dateInput); });

    // Some rules depend on the enquiry type, so re-check those fields when it changes
    typeSelect.addEventListener("change", function () {
        const isCustom = typeSelect.value === "custom-order";
        messageLabel.textContent = isCustom ? "Describe your cake *" : "Extra details (optional)";
        messageBox.required = isCustom;

        [document.getElementById("quantity"), dateInput, messageBox].forEach(function (field) {
            if (field.value.trim() !== "" || field.classList.contains("invalid")) validateField(field);
        });
    });

    // Live character counter for the details box
    messageBox.addEventListener("input", function () {
        messageCounter.textContent = messageBox.value.length + " / 500 characters";
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // stop the page reloading

        // Bots are quietly ignored - no message, so they learn nothing
        if (looksLikeSpam(form)) return;

        // Validate every field; the error summary lists anything wrong.
        // An old estimate is hidden so it can't be mistaken for the new one.
        if (!validateForm(form, validateField)) {
            responseBox.classList.remove("show");
            return;
        }

        const quote = buildQuote();
        showQuote(quote);
        await sendWithAjax(form);
    });

    // ----- Validation rules for each field -----
    function validateField(field) {
        const value = field.value.trim();
        const type = typeSelect.value;
        clearError(field);

        switch (field.id) {
            case "full-name":
                if (value === "") return fail(field, "Please enter your full name.");
                if (!isValidName(value)) return fail(field, "Name can only contain letters, spaces, hyphens and apostrophes.");
                if (!/\S+\s+\S+/.test(value)) return fail(field, "Please enter your first name and surname.");
                break;

            case "email":
                if (value === "") return fail(field, "Please enter your email address.");
                if (!isValidEmail(value)) return fail(field, "Please enter a valid email, e.g. name@example.com.");
                break;

            case "phone":
                if (value === "") return fail(field, "Please enter your phone number so we can confirm your order.");
                if (!isValidSAPhone(value)) return fail(field, "Please enter a valid SA number, e.g. 082 123 4567.");
                break;

            case "enquiry-type":
                if (value === "") return fail(field, "Please choose what your enquiry is about.");
                break;

            case "product":
                if (value === "") return fail(field, "Please choose a product.");
                break;

            case "quantity": {
                const qty = Number(value);
                if (value === "" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
                    return fail(field, "Quantity must be a whole number from 1 to " + MAX_QUANTITY + ".");
                }
                if (type === "bulk-order" && qty < BULK_QUANTITY) {
                    return fail(field, "Bulk orders start at " + BULK_QUANTITY + " items. For fewer, choose another enquiry type.");
                }
                break;
            }

            case "date-needed": {
                if (value === "") return fail(field, "Please choose the date you need your order.");
                const date = new Date(value + "T00:00:00");
                if (isNaN(date)) return fail(field, "Please enter a real date.");
                if (value < dateInput.min) {
                    return fail(field, "We need at least " + NOTICE_DAYS + " days' notice. Choose " + formatDate(dateInput.min) + " or later.");
                }
                if (type === "catering" && value < toInputDate(addDays(new Date(), CATERING_NOTICE_DAYS))) {
                    return fail(field, "Event catering needs at least " + CATERING_NOTICE_DAYS + " days' notice.");
                }
                if (value > dateInput.max) {
                    return fail(field, "We take orders up to " + MAX_MONTHS_AHEAD + " months ahead. Choose " + formatDate(dateInput.max) + " or earlier.");
                }
                if (date.getDay() === 0) {
                    return fail(field, "We're closed on Sundays. Please choose a Monday to Saturday date.");
                }
                break;
            }

            case "message":
                if (type === "custom-order" && value.length < MIN_CUSTOM_DETAILS) {
                    return fail(field, "Please describe your cake (flavour, theme, writing) in at least " + MIN_CUSTOM_DETAILS + " characters.");
                }
                if (value.length > 500) return fail(field, "Please keep your message under 500 characters.");
                if (containsLink(value)) return fail(field, "Please remove web links from your message.");
                break;
        }

        markValid(field);
        return true;
    }

    function fail(field, message) {
        showError(field, message);
        return false;
    }

    // ----- Work out the cost and availability -----
    function buildQuote() {
        const product = products.find(function (p) { return p.id === productSelect.value; });
        const quantity = Number(document.getElementById("quantity").value);
        const subtotal = product.price * quantity;
        const discount = quantity >= BULK_QUANTITY ? subtotal * BULK_DISCOUNT : 0;

        return {
            name: document.getElementById("full-name").value.trim(),
            type: document.getElementById("enquiry-type").selectedOptions[0].textContent,
            product: product,
            quantity: quantity,
            subtotal: subtotal,
            discount: discount,
            total: subtotal - discount,
            dateText: formatDate(dateInput.value),
            needsCall: quantity > 100
        };
    }

    // ----- Show the response to the user (built with DOM methods) -----
    function showQuote(quote) {
        responseBox.innerHTML = "";

        const heading = document.createElement("h3");
        heading.textContent = "Thank you, " + quote.name + "! Here is your estimate:";
        responseBox.appendChild(heading);

        const list = document.createElement("ul");
        addItem(list, "Enquiry type: " + quote.type);
        addItem(list, "Product: " + quote.quantity + " × " + quote.product.name + " (" + formatRand(quote.product.price) + " " + quote.product.unit + ")");
        addItem(list, "Subtotal: " + formatRand(quote.subtotal));
        if (quote.discount > 0) {
            addItem(list, "Bulk discount (10% for " + BULK_QUANTITY + "+ items): -" + formatRand(quote.discount));
        }
        addItem(list, "Estimated total: " + formatRand(quote.total));
        responseBox.appendChild(list);

        // Sundays and too-early dates are already rejected by validation
        const availability = document.createElement("p");
        availability.textContent = "✔ " + quote.dateText + " is available. Your order will be ready for collection from 08:00.";
        responseBox.appendChild(availability);

        if (quote.needsCall) {
            const call = document.createElement("p");
            call.textContent = "Because this is a large order, our team will phone you within one working day to confirm.";
            responseBox.appendChild(call);
        }

        const note = document.createElement("p");
        note.className = "hint";
        note.textContent = "This is an estimate. Final prices are confirmed when we reply by email.";
        responseBox.appendChild(note);

        responseBox.classList.add("show");
        responseBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function addItem(list, text) {
        const li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
    }
});

// ----- AJAX: send the form without reloading the page -----
// The form's action attribute holds the URL. Replace "your-form-id" in
// enquiry.html with your own Formspree ID (see README) to receive the emails.
async function sendWithAjax(form) {
    const status = document.getElementById("enquiry-status");

    if (form.action.includes("your-form-id")) {
        status.textContent = "Demo mode: add your Formspree form ID to send enquiries to the bakery.";
        return;
    }

    status.textContent = "Sending your enquiry…";
    setSubmitting(form, true, "Sending…"); // stops a second click sending it twice
    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Server responded with " + response.status);
        status.textContent = "Your enquiry has been sent. We will reply by email within one working day.";
        form.reset();
        getFormFields(form).forEach(clearError);
    } catch (error) {
        status.textContent = "Sorry, your enquiry could not be sent. Please try again or phone us on 076 258 5159.";
        console.error(error);
    } finally {
        setSubmitting(form, false);
    }
}

// ----- Date helpers -----
function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}

// Turns "2026-11-07" into "Saturday, 7 November 2026"
function formatDate(isoDate) {
    return new Date(isoDate + "T00:00:00").toLocaleDateString("en-ZA",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// Formats a date as YYYY-MM-DD (the format <input type="date"> uses)
function toInputDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
}
