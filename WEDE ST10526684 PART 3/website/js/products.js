// products.js
// Products page: loads the product cards dynamically from PRODUCTS,
// adds search / category filter / sort, and a lightbox gallery.

document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("product-grid");
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("category");
    const sortSelect = document.getElementById("sort");
    const resultsCount = document.getElementById("results-count");

    // Fill the category dropdown from the product data
    const categories = [...new Set(PRODUCTS.map(function (p) { return p.category; }))];
    categories.forEach(function (category) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // The list currently on screen - the lightbox uses this order
    let visibleProducts = [];

    function renderProducts() {
        const searchText = searchInput.value.trim().toLowerCase();
        const category = categorySelect.value;

        // 1. Filter
        visibleProducts = PRODUCTS.filter(function (product) {
            const matchesSearch =
                product.name.toLowerCase().includes(searchText) ||
                product.description.toLowerCase().includes(searchText);
            const matchesCategory = category === "all" || product.category === category;
            return matchesSearch && matchesCategory;
        });

        // 2. Sort
        const sortBy = sortSelect.value;
        visibleProducts.sort(function (a, b) {
            if (sortBy === "price-low") return a.price - b.price;
            if (sortBy === "price-high") return b.price - a.price;
            if (sortBy === "name-za") return b.name.localeCompare(a.name);
            return a.name.localeCompare(b.name);
        });

        // 3. Draw the cards
        grid.innerHTML = "";
        visibleProducts.forEach(function (product) {
            grid.appendChild(createProductCard(product, true));
        });

        resultsCount.textContent = visibleProducts.length === 0
            ? "No products match your search. Try another word or category."
            : "Showing " + visibleProducts.length + " of " + PRODUCTS.length + " products";
    }

    searchInput.addEventListener("input", renderProducts);
    categorySelect.addEventListener("change", renderProducts);
    sortSelect.addEventListener("change", renderProducts);
    renderProducts();

    // ===== Lightbox =====
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const closeButton = lightbox.querySelector(".close");
    const prevButton = lightbox.querySelector(".prev");
    const nextButton = lightbox.querySelector(".next");
    let currentIndex = 0;
    let lastFocused = null;

    function showImage(index) {
        currentIndex = (index + visibleProducts.length) % visibleProducts.length;
        const product = visibleProducts[currentIndex];
        lightboxImage.src = "images/" + product.image; // full-size image
        lightboxImage.alt = product.alt;
        lightboxCaption.textContent =
            product.name + " - " + formatRand(product.price) + " " + product.unit;
    }

    function openLightbox(index) {
        lastFocused = document.activeElement;
        showImage(index);
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
        closeButton.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
        if (lastFocused) lastFocused.focus();
    }

    // One click listener on the grid handles every card (event delegation)
    grid.addEventListener("click", function (event) {
        const button = event.target.closest(".image-button");
        if (!button) return;
        const index = visibleProducts.findIndex(function (p) { return p.id === button.dataset.id; });
        openLightbox(index);
    });

    closeButton.addEventListener("click", closeLightbox);
    prevButton.addEventListener("click", function () { showImage(currentIndex - 1); });
    nextButton.addEventListener("click", function () { showImage(currentIndex + 1); });

    // Clicking the dark background closes the lightbox
    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) closeLightbox();
    });

    // Keyboard: Esc closes, arrows change image
    document.addEventListener("keydown", function (event) {
        if (!lightbox.classList.contains("open")) return;
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") showImage(currentIndex - 1);
        if (event.key === "ArrowRight") showImage(currentIndex + 1);
    });
});
