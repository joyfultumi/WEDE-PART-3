// products-data.js
// One list of products used by the Home, Products and Enquiry pages.
// To add a product, add an object here - the pages update automatically.

const PRODUCTS = [
    {
        id: "red-velvet-cake",
        name: "Red Velvet Cake",
        category: "Cakes",
        price: 350,
        unit: "per cake",
        image: "red-velvet-cake.jpeg",
        alt: "Red velvet cake with cream cheese icing",
        description: "Soft red velvet sponge layered with cream cheese icing.",
        featured: true
    },
    {
        id: "mothers-day-cakes",
        name: "Mother's Day Mini Cakes",
        category: "Cakes",
        price: 220,
        unit: "per cake",
        image: "mothers-day-cakes.jpeg",
        alt: "Pink Mother's Day mini cakes decorated with hearts and piped icing",
        description: "Pink mini cakes topped with chocolate hearts, meringues and gold pearls.",
        featured: true
    },
    {
        id: "bento-cake",
        name: "Bento Cake & Cupcake Box",
        category: "Cakes",
        price: 280,
        unit: "per box",
        image: "bento-cake.jpeg",
        alt: "Themed bento cake in a gift box with matching cupcakes",
        description: "A small themed bento cake with six matching cupcakes - perfect for birthdays.",
        featured: false
    },
    {
        id: "cup-cakes",
        name: "Cupcakes",
        category: "Cupcakes & Muffins",
        price: 15,
        unit: "each",
        image: "cup-cakes.jpeg",
        alt: "Cupcakes with swirled buttercream icing",
        description: "Vanilla or chocolate cupcakes with swirled buttercream.",
        featured: false
    },
    {
        id: "blueberry-muffins",
        name: "Blueberry Muffins",
        category: "Cupcakes & Muffins",
        price: 18,
        unit: "each",
        image: "blueberry-muffins.jpeg",
        alt: "Golden blueberry muffins",
        description: "Moist muffins packed with juicy blueberries.",
        featured: true
    },
    {
        id: "vanilla-muffins",
        name: "Vanilla Muffins",
        category: "Cupcakes & Muffins",
        price: 12,
        unit: "each",
        image: "muffins.jpeg",
        alt: "Box of freshly baked vanilla muffins",
        description: "Light, golden vanilla muffins baked fresh every morning.",
        featured: false
    },
    {
        id: "scones",
        name: "Classic Scones",
        category: "Scones",
        price: 10,
        unit: "each",
        image: "scones.jpeg",
        alt: "Classic plain scones",
        description: "Plain, fruit or cheese scones - ideal with jam and cream.",
        featured: false
    },
    {
        id: "soft-scones",
        name: "Soft Buttermilk Scones",
        category: "Scones",
        price: 12,
        unit: "each",
        image: "soft-scones.jpeg",
        alt: "Soft buttermilk scones",
        description: "Extra soft, fluffy buttermilk scones.",
        featured: false
    },
    {
        id: "snowballs",
        name: "Coconut Snowballs",
        category: "Pastries & Treats",
        price: 14,
        unit: "each",
        image: "snowballs.jpeg",
        alt: "Pink coconut snowballs topped with cream and a strawberry",
        description: "Sponge balls rolled in pink coconut, topped with cream and fruit.",
        featured: false
    },
    {
        id: "filled-bagels",
        name: "Filled Bagel Platter",
        category: "Pastries & Treats",
        price: 45,
        unit: "per bagel",
        image: "pastry.jpeg",
        alt: "Platter of bagels filled with ham, cheese and lettuce",
        description: "Fresh bagels filled with ham, cheese and lettuce - great for events.",
        featured: false
    }
];

// Formats a number as South African Rand, e.g. 350 -> "R350.00"
function formatRand(amount) {
    return "R" + amount.toFixed(2);
}
