// products-data.js
// Loads the product list from products.json with fetch() (AJAX).
// The Home, Products and Enquiry pages all call loadProducts().
// To add or change a product, edit products.json - no code changes needed.

const PRODUCTS_URL = "products.json";

// Remembers the request so the file is only downloaded once per page
let productsRequest = null;

function loadProducts() {
    if (productsRequest === null) {
        productsRequest = fetchProducts();
    }
    return productsRequest;
}

async function fetchProducts() {
    // fetch() can't read files when the page is opened by double-clicking it
    if (window.location.protocol === "file:") {
        throw new Error("Open the site with Live Server or the live website - " +
            "browsers block loading products.json from a file on your computer.");
    }

    const response = await fetch(PRODUCTS_URL);
    if (!response.ok) {
        throw new Error("products.json could not be loaded (status " + response.status + ").");
    }

    const data = await response.json();
    if (!Array.isArray(data.products)) {
        throw new Error("products.json has no \"products\" list.");
    }
    return data.products;
}

// Shows a friendly "couldn't load" message inside a container
function showLoadError(container, error) {
    console.error(error);
    container.innerHTML = "";

    const message = document.createElement("p");
    message.className = "load-error";
    message.setAttribute("role", "alert");
    message.textContent = "Sorry, our products couldn't be loaded right now. Please refresh the page, or ";

    const link = document.createElement("a");
    link.href = "contact.html";
    link.textContent = "contact us for a price list";
    message.append(link, ".");

    container.appendChild(message);
}

// Formats a number as South African Rand, e.g. 350 -> "R350.00"
function formatRand(amount) {
    return "R" + amount.toFixed(2);
}
