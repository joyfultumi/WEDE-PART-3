// contact.js
// Contact page: validates the contact form, compiles the details into an
// email and opens the user's email app addressed to the bakery.
// Also draws the interactive Leaflet map.

const BAKERY_EMAIL = "info@joyfuldelightsbakery.com";

// Approximate location of the bakery (Nietgedacht, Gauteng).
// Check these on https://www.openstreetmap.org and update if needed.
const BAKERY_LOCATION = [-25.9567, 27.9619];

document.addEventListener("DOMContentLoaded", function () {
    setUpContactForm();
    setUpMap();
});

function setUpContactForm() {
    const form = document.getElementById("contact-form");
    const message = document.getElementById("message");
    const counter = document.getElementById("message-count");
    const responseBox = document.getElementById("contact-response");

    // Live character counter for the message box
    message.addEventListener("input", function () {
        counter.textContent = message.value.length + " / 1000 characters";
    });

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.addEventListener("blur", function () { validateContactField(field); });
        field.addEventListener("input", function () {
            if (field.classList.contains("invalid")) validateContactField(field);
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const fields = Array.from(form.querySelectorAll("input, select, textarea"));
        const invalidFields = fields.filter(function (field) { return !validateContactField(field); });
        if (invalidFields.length > 0) {
            invalidFields[0].focus();
            return;
        }

        // Compile the form data into an email
        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const phone = document.getElementById("contact-phone").value.trim();
        const type = document.getElementById("message-type").value;
        const subject = document.getElementById("subject").value.trim();

        const emailSubject = "[" + type + "] " + subject;
        const emailBody =
            "Name: " + name + "\n" +
            "Email: " + email + "\n" +
            "Phone: " + (phone || "Not given") + "\n" +
            "Message type: " + type + "\n\n" +
            message.value.trim();

        const mailtoLink = "mailto:" + BAKERY_EMAIL +
            "?subject=" + encodeURIComponent(emailSubject) +
            "&body=" + encodeURIComponent(emailBody);

        // Show a confirmation with a button in case the email app did not open
        responseBox.innerHTML = "";
        const heading = document.createElement("h3");
        heading.textContent = "Thanks, " + name + "! Your email is ready.";
        const text = document.createElement("p");
        text.textContent = "Your email app should open with your message to " + BAKERY_EMAIL +
            ". Press Send in your email app to deliver it. If it did not open, use the button below.";
        const link = document.createElement("a");
        link.className = "button";
        link.href = mailtoLink;
        link.textContent = "Open email again";
        responseBox.append(heading, text, link);
        responseBox.classList.add("show");

        window.location.href = mailtoLink;
    });
}

function validateContactField(field) {
    const value = field.value.trim();
    clearError(field);

    switch (field.id) {
        case "contact-name":
            if (value.length < 2) return failContact(field, "Please enter your name.");
            if (!/^[A-Za-zÀ-ÿ' -]+$/.test(value)) return failContact(field, "Name can only contain letters, spaces, hyphens and apostrophes.");
            break;
        case "contact-email":
            if (!isValidEmail(value)) return failContact(field, "Please enter a valid email, e.g. name@example.com.");
            break;
        case "contact-phone":
            // Optional - only check it if something was typed
            if (value !== "" && !isValidSAPhone(value)) return failContact(field, "Please enter a valid SA number, e.g. 082 123 4567.");
            break;
        case "message-type":
            if (value === "") return failContact(field, "Please choose the type of message.");
            break;
        case "subject":
            if (value.length < 3 || value.length > 80) return failContact(field, "Subject must be 3 to 80 characters.");
            break;
        case "message":
            if (value.length < 20) return failContact(field, "Please write at least 20 characters so we can help you.");
            if (value.length > 1000) return failContact(field, "Please keep your message under 1000 characters.");
            break;
    }
    return true;
}

function failContact(field, message) {
    showError(field, message);
    return false;
}

// ===== Interactive map using Leaflet + OpenStreetMap =====
function setUpMap() {
    const mapBox = document.getElementById("map");
    if (!mapBox || typeof L === "undefined") return;

    const map = L.map("map", { scrollWheelZoom: false }).setView(BAKERY_LOCATION, 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(BAKERY_LOCATION)
        .addTo(map)
        .bindPopup("<strong>Joyful Delights Bakery</strong><br>21701 Badger Street, Nietgedacht, 1739")
        .openPopup();

    // Draw a circle showing the area we deliver to (about 10 km)
    L.circle(BAKERY_LOCATION, {
        radius: 10000,
        color: "#8e24aa",
        fillColor: "#e083d4",
        fillOpacity: 0.12
    }).addTo(map).bindTooltip("Free delivery area (10 km)");

    // Button that zooms back to the bakery
    document.getElementById("recenter-map").addEventListener("click", function () {
        map.setView(BAKERY_LOCATION, 14);
    });
}
