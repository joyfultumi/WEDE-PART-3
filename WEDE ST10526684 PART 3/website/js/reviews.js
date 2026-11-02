// reviews.js
// Home page: customer reviews carousel built with jQuery.
// jQuery is used here because its built-in fadeIn()/fadeOut() effects and
// short DOM syntax ($("<p>").text(...)) make a carousel quick to build.
// The rest of the site uses plain JavaScript because it needs no animations.

// Sample reviews for the storyline - replace them with real customer reviews
const REVIEWS = [
    {
        name: "Lerato M.",
        rating: 5,
        product: "Mother's Day Mini Cakes",
        text: "The Mother's Day cakes were almost too pretty to eat! My mom loved them."
    },
    {
        name: "Johan van der Merwe",
        rating: 5,
        product: "Blueberry Muffins",
        text: "Best blueberry muffins in Nietgedacht. We order two dozen for the office every Friday."
    },
    {
        name: "Ayesha K.",
        rating: 4,
        product: "Bento Cake & Cupcake Box",
        text: "My son's themed bento cake was exactly what he wanted. Collection was quick and easy."
    },
    {
        name: "Sipho N.",
        rating: 5,
        product: "Red Velvet Cake",
        text: "Moist, rich and not too sweet. The enquiry form gave me a price straight away."
    },
    {
        name: "Carla D.",
        rating: 5,
        product: "Coconut Snowballs",
        text: "Ordered snowballs for a school function and every single one was gone in minutes."
    }
];

const SLIDE_SECONDS = 6;   // time each review stays on screen
const FADE_MS = 400;       // length of the fade animation

$(function () {
    const $carousel = $("#reviews-carousel");
    if ($carousel.length === 0) return;

    const $slide = $carousel.find(".review-slide");
    const $dots = $carousel.find(".review-dots");
    let current = 0;
    let timer = null;

    // Create one dot button per review
    $.each(REVIEWS, function (index, review) {
        $("<button>", {
            type: "button",
            class: "review-dot",
            "aria-label": "Show review " + (index + 1) + " of " + REVIEWS.length + " by " + review.name
        })
            .on("click", function () {
                showReview(index);
                restartAutoplay();
            })
            .appendTo($dots);
    });

    // Builds the HTML for one review (.text() keeps the data safe)
    function buildReview(review) {
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        return $("<blockquote>").append(
            $("<p>", { class: "review-stars", "aria-label": review.rating + " out of 5 stars" }).text(stars),
            $("<p>", { class: "review-text" }).text("“" + review.text + "”"),
            $("<footer>").append(
                $("<strong>").text(review.name),
                document.createTextNode(" – " + review.product)
            )
        );
    }

    // Fades the old review out, swaps the content, then fades the new one in
    function showReview(index, instant) {
        current = (index + REVIEWS.length) % REVIEWS.length;

        $dots.children()
            .removeClass("active").attr("aria-current", null)
            .eq(current).addClass("active").attr("aria-current", "true");

        if (instant) {
            $slide.empty().append(buildReview(REVIEWS[current]));
            return;
        }

        $slide.stop(true, true).fadeOut(FADE_MS, function () {
            $slide.empty().append(buildReview(REVIEWS[current])).fadeIn(FADE_MS);
        });
    }

    // ----- Autoplay -----
    function startAutoplay() {
        // Don't auto-move for users who ask their device for less motion
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        stopAutoplay();
        timer = setInterval(function () { showReview(current + 1); }, SLIDE_SECONDS * 1000);
    }

    function stopAutoplay() {
        clearInterval(timer);
        timer = null;
    }

    function restartAutoplay() {
        if (timer !== null) startAutoplay();
    }

    // ----- Controls -----
    $carousel.find(".review-prev").on("click", function () {
        showReview(current - 1);
        restartAutoplay();
    });

    $carousel.find(".review-next").on("click", function () {
        showReview(current + 1);
        restartAutoplay();
    });

    // Pause / Play button. Autoplay restarts when the mouse or focus leaves.
    const $pause = $carousel.find(".review-pause").on("click", function () {
        const isPaused = $pause.attr("aria-pressed") === "true";
        $pause.attr("aria-pressed", String(!isPaused)).text(isPaused ? "Pause" : "Play");
        stopAutoplay();
    });

    // Pause while the mouse is over the carousel or a control has keyboard focus
    $carousel.on("mouseenter focusin", stopAutoplay);
    $carousel.on("mouseleave focusout", function (event) {
        if (event.relatedTarget && $.contains(this, event.relatedTarget)) return; // still inside the carousel
        if ($pause.attr("aria-pressed") !== "true") startAutoplay(); // unless the user pressed Pause
    });

    // Left / right arrow keys when the carousel has focus
    $carousel.on("keydown", function (event) {
        if (event.key === "ArrowLeft") $carousel.find(".review-prev").trigger("click");
        if (event.key === "ArrowRight") $carousel.find(".review-next").trigger("click");
    });

    showReview(0, true);
    startAutoplay();
});
