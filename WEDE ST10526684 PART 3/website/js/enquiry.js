// enquiry.js
// Enquiry page: validates the form with JavaScript, works out an estimated
// cost and availability, shows it to the user, and sends the form with AJAX.

const NOTICE_DAYS = 2;          // orders need at least 2 days' notice
const BULK_QUANTITY = 24;       // 24 or more items gets a discount
const BULK_DISCOUNT = 0.10;     // 10% discount
const MAX_QUANTITY = 200;

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
        } catch (error) {
            console.error(error);
            placeholder.textContent = "Products could not be loaded";
            showError(productSelect, "Our product list couldn't be loaded. Please refresh the page or phone us on 076 258 5159.");
        }
    }

    // Earliest date that can be picked = today + notice days
    dateInput.min = toInputDate(addDays(new Date(), NOTICE_DAYS));

    // Re-check a field as soon as the user leaves it
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.addEventListener("blur", function () { validateField(field); });
        field.addEventListener("input", function () {
            if (field.classList.contains("invalid")) validateField(field);
        });
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // stop the page reloading

        // Validate every field and focus the first one with a problem
        const fields = Array.from(form.querySelectorAll("input, select, textarea"));
        const invalidFields = fields.filter(function (field) { return !validateField(field); });
        if (invalidFields.length > 0) {
            invalidFields[0].focus();
            return;
        }

        const quote = buildQuote();
        showQuote(quote);
        await sendWithAjax(form);
    });

    // ----- Validation rules for each field -----
    function validateField(field) {
        const value = field.value.trim();
        clearError(field);

        switch (field.id) {
            case "full-name":
                if (value.length < 2) return fail(field, "Please enter your full name.");
                if (!/^[A-Za-zÀ-ÿ' -]+$/.test(value)) return fail(field, "Name can only contain letters, spaces, hyphens and apostrophes.");
                break;
            case "email":
                if (!isValidEmail(value)) return fail(field, "Please enter a valid email, e.g. name@example.com.");
                break;
            case "phone":
                if (!isValidSAPhone(value)) return fail(field, "Please enter a valid SA number, e.g. 082 123 4567.");
                break;
            case "enquiry-type":
            case "product":
                if (value === "") return fail(field, "Please choose an option.");
                break;
            case "quantity": {
                const qty = Number(value);
                if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
                    return fail(field, "Quantity must be a whole number from 1 to " + MAX_QUANTITY + ".");
                }
                break;
            }
            case "date-needed":
                if (value === "") return fail(field, "Please choose the date you need your order.");
                if (value < dateInput.min) return fail(field, "We need at least " + NOTICE_DAYS + " days' notice. Choose " + dateInput.min + " or later.");
                break;
            case "message":
                if (value.length > 500) return fail(field, "Please keep your message under 500 characters.");
                break;
        }
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
        const date = new Date(dateInput.value + "T00:00:00");
        const subtotal = product.price * quantity;
        const discount = quantity >= BULK_QUANTITY ? subtotal * BULK_DISCOUNT : 0;
        const isSunday = date.getDay() === 0;

        return {
            name: document.getElementById("full-name").value.trim(),
            type: document.getElementById("enquiry-type").selectedOptions[0].textContent,
            product: product,
            quantity: quantity,
            subtotal: subtotal,
            discount: discount,
            total: subtotal - discount,
            dateText: date.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
            available: !isSunday,
            needsCall: quantity > 100
        };
    }

    // ----- Show the response to the user (built with DOM methods) -----
    function showQuote(quote) {
        responseBox.innerHTML = "";
        responseBox.classList.toggle("warning", !quote.available);

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

        const availability = document.createElement("p");
        if (!quote.available) {
            availability.textContent = "⚠ We are closed on Sundays, so " + quote.dateText +
                " is not available. Please choose a Monday to Saturday date, or collect on the Saturday before.";
        } else {
            availability.textContent = "✔ " + quote.dateText + " is available. Your order will be ready for collection from 08:00.";
        }
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
    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Server responded with " + response.status);
        status.textContent = "Your enquiry has been sent. We will reply by email within one working day.";
        form.reset();
    } catch (error) {
        status.textContent = "Sorry, your enquiry could not be sent. Please try again or phone us on 076 258 5159.";
        console.error(error);
    }
}

// ----- Date helpers -----
function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}

// Formats a date as YYYY-MM-DD (the format <input type="date"> uses)
function toInputDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
}
