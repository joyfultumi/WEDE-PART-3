// contact.js
// Contact page: validates the contact form, compiles the details into an
// email and opens the user's email app addressed to the bakery.
// Also draws the interactive Leaflet map with location-based features:
// delivery zones, a "check my delivery" tool and directions to the bakery.

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

        // Open the user's email app with the compiled message
        window.location.href = mailtoLink;

        // Show a success message with a button in case the email app did not open
        responseBox.innerHTML = "";
        const heading = document.createElement("h3");
        heading.textContent = "✔ Thank you, " + name + "! Your message has been sent to your email app.";
        const text = document.createElement("p");
        text.textContent = "Your message to " + BAKERY_EMAIL + " is ready in your email app - press Send there to deliver it. " +
            "We reply within one working day. If your email app did not open, use the button below.";
        const link = document.createElement("a");
        link.className = "button";
        link.href = mailtoLink; // still holds the message after the form is cleared
        link.textContent = "Open email again";
        responseBox.append(heading, text, link);
        responseBox.classList.add("show");
        responseBox.scrollIntoView({ behavior: "smooth", block: "center" });

        // Clear all the fields so the form is ready for a new message
        form.reset();
        fields.forEach(clearError);
        counter.textContent = "0 / 1000 characters";
    });

    // Hide the success message when the user starts typing a new message
    form.addEventListener("input", function () {
        responseBox.classList.remove("show");
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
// Delivery zones, measured in a straight line from the bakery
const DELIVERY_ZONES = [
    { maxKm: 10, fee: 0, label: "Free delivery zone", color: "#8e24aa", fill: "#e083d4" },
    { maxKm: 25, fee: 50, label: "R50 delivery zone", color: "#c77700", fill: "#ffd08a" }
];

const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1";

function setUpMap() {
    const mapBox = document.getElementById("map");
    if (!mapBox || typeof L === "undefined") return;

    const map = L.map("map", { scrollWheelZoom: false }).setView(BAKERY_LOCATION, 11);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Draw the delivery zones, biggest first so the smaller one sits on top
    DELIVERY_ZONES.slice().reverse().forEach(function (zone) {
        L.circle(BAKERY_LOCATION, {
            radius: zone.maxKm * 1000,
            color: zone.color,
            fillColor: zone.fill,
            fillOpacity: 0.15,
            weight: 2
        }).addTo(map).bindTooltip(zone.label + " (up to " + zone.maxKm + " km)");
    });

    L.marker(BAKERY_LOCATION, { title: "Joyful Delights Bakery" })
        .addTo(map)
        .bindPopup("<strong>Joyful Delights Bakery</strong><br>21701 Badger Street, Nietgedacht, 1739")
        .openPopup();

    // Things drawn for the customer's location (replaced on every check)
    const customerLayer = L.layerGroup().addTo(map);
    const resultBox = document.getElementById("delivery-result");
    const directionsLink = document.getElementById("directions-link");
    const locateButton = document.getElementById("locate-me");
    const addressForm = document.getElementById("address-search");
    const addressInput = document.getElementById("address-input");

    // Directions to the bakery work even before the customer checks a location
    directionsLink.href = DIRECTIONS_URL + "&destination=" + BAKERY_LOCATION.join(",");

    // ----- Option 1: use the device's location (Geolocation API) -----
    locateButton.addEventListener("click", function () {
        if (!("geolocation" in navigator)) {
            showMessage("Your browser can't share its location. Search for your suburb instead.", "warning");
            return;
        }

        locateButton.disabled = true;
        showMessage("Finding your location… please allow location access if your browser asks.");

        navigator.geolocation.getCurrentPosition(
            function (position) {
                locateButton.disabled = false;
                checkDelivery([position.coords.latitude, position.coords.longitude], "Your location");
            },
            function (error) {
                locateButton.disabled = false;
                const reasons = {
                    1: "Location access was blocked.",
                    2: "Your location could not be found.",
                    3: "Finding your location took too long."
                };
                showMessage((reasons[error.code] || "Something went wrong.") +
                    " Search for your suburb or click your area on the map instead.", "warning");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    });

    // ----- Option 2: search for a suburb or address (OpenStreetMap Nominatim) -----
    addressForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const query = addressInput.value.trim();
        clearError(addressInput);

        if (query.length < 3) {
            showError(addressInput, "Type at least 3 letters, e.g. Lanseria or Fourways.");
            return;
        }

        showMessage("Searching for “" + query + "”…");
        try {
            const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=za&q=" +
                encodeURIComponent(query);
            const response = await fetch(url, { headers: { Accept: "application/json" } });
            if (!response.ok) throw new Error("Search failed: " + response.status);

            const results = await response.json();
            if (results.length === 0) {
                showMessage("We couldn't find “" + query + "”. Try a nearby suburb or town name.", "warning");
                return;
            }
            const place = results[0];
            const shortName = place.name || place.display_name.split(",")[0];
            checkDelivery([Number(place.lat), Number(place.lon)], shortName);
        } catch (error) {
            console.error(error);
            showMessage("Address search is not available right now. Click your area on the map instead.", "warning");
        }
    });

    // ----- Option 3: click anywhere on the map -----
    map.on("click", function (event) {
        checkDelivery([event.latlng.lat, event.latlng.lng], "The point you clicked");
    });

    // Works out the distance and zone, then updates the map and the message
    function checkDelivery(location, placeName) {
        const km = distanceInKm(BAKERY_LOCATION, location);
        const zone = DELIVERY_ZONES.find(function (z) { return km <= z.maxKm; });

        // Draw the customer's marker and a dashed line to the bakery
        customerLayer.clearLayers();
        const label = document.createElement("span");
        label.textContent = placeName; // textContent, because Leaflet would run a plain string as HTML
        L.circleMarker(location, { radius: 9, color: "#5b0660", fillColor: "#ffffff", fillOpacity: 1, weight: 4 })
            .addTo(customerLayer)
            .bindTooltip(label, { permanent: true, direction: "top", offset: [0, -10] });
        L.polyline([location, BAKERY_LOCATION], { color: "#5b0660", weight: 3, dashArray: "6 8" })
            .addTo(customerLayer);
        map.fitBounds(L.latLngBounds([location, BAKERY_LOCATION]), { padding: [50, 50], maxZoom: 14 });

        // Message for the customer
        const distanceText = km.toFixed(1) + " km";
        if (!zone) {
            showMessage(placeName + " is " + distanceText + " from the bakery - outside our delivery area. " +
                "You're welcome to collect your order from the bakery.", "warning");
        } else if (zone.fee === 0) {
            showMessage("🎉 " + placeName + " is " + distanceText + " from the bakery - you get FREE delivery!", "success");
        } else {
            showMessage(placeName + " is " + distanceText + " from the bakery - delivery costs " +
                formatFee(zone.fee) + ".", "success");
        }

        // Directions now start from the customer's location
        const origin = location.map(function (n) { return n.toFixed(5); }).join(",");
        directionsLink.href = DIRECTIONS_URL + "&origin=" + origin +
            "&destination=" + BAKERY_LOCATION.join(",");
    }

    function showMessage(text, type) {
        resultBox.textContent = text;
        resultBox.className = "delivery-result" + (type ? " " + type : "");
    }

    // Button that zooms back to the bakery
    document.getElementById("recenter-map").addEventListener("click", function () {
        map.setView(BAKERY_LOCATION, 11);
    });
}

// Straight-line distance between two [latitude, longitude] points,
// using the Haversine formula (the Earth is treated as a sphere).
function distanceInKm(pointA, pointB) {
    const EARTH_RADIUS_KM = 6371;
    const toRadians = function (degrees) { return degrees * Math.PI / 180; };

    const dLat = toRadians(pointB[0] - pointA[0]);
    const dLon = toRadians(pointB[1] - pointA[1]);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(pointA[0])) * Math.cos(toRadians(pointB[0])) * Math.sin(dLon / 2) ** 2;

    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatFee(amount) {
    return "R" + amount.toFixed(2);
}
