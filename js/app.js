/**
 * Jwax Prime Laptops - Centralized Core Engine & Global State Orchestrator
 */

// 1. Immutable Global Inventory Database Matrix Configuration
const JWAX_DATABASE = [
    {
        id: "LP001",
        name: "Lenovo ThinkPad X1 Carbon Gen 9",
        brand: "Lenovo",
        category: "Enterprise",
        ram: "16GB",
        storage: "512GB NVMe SSD",
        processor: "Intel Core i7 11th Gen",
        grade: "Grade A Pristine",
        price: 750000,
        slashedPrice: 850000,
        discount: 11,
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        isFeatured: true,
        isFlashSale: false
    },
    {
        id: "LP002",
        name: "HP EliteBook 840 G8 Workstation",
        brand: "HP",
        category: "Enterprise",
        ram: "32GB",
        storage: "1TB NVMe SSD",
        processor: "Intel Core i7 11th Gen",
        grade: "Grade A Premium",
        price: 820000,
        slashedPrice: 950000,
        discount: 13,
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
        isFeatured: true,
        isFlashSale: true
    },
    {
        id: "LP003",
        name: "Dell XPS 15 9510 Creator Edition",
        brand: "Dell",
        category: "Creative",
        ram: "32GB",
        storage: "1TB NVMe SSD",
        processor: "Intel Core i9 11th Gen / RTX 3050Ti",
        grade: "Grade A Pristine",
        price: 1350000,
        slashedPrice: 1500000,
        discount: 10,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        isFeatured: true,
        isFlashSale: false
    },
    {
        id: "LP004",
        name: "Apple MacBook Pro 16\" M1 Pro",
        brand: "Apple",
        category: "Creative",
        ram: "16GB",
        storage: "512GB Unified SSD",
        processor: "M1 Pro 10-Core CPU",
        grade: "Open Box Factory Grade",
        price: 1650000,
        slashedPrice: 1800000,
        discount: 8,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        isFeatured: false,
        isFlashSale: true
    }
];

// Expose database globally to let feature-specific script extensions read stock
window.JWAX_DATABASE = JWAX_DATABASE;

// 2. Global Application State Infrastructure Object Definition
const AppState = {
    cart: JSON.parse(localStorage.getItem('jwax_cart_manifest')) || [],
    wishlist: JSON.parse(localStorage.getItem('jwax_wishlist_manifest')) || [],
    theme: localStorage.getItem('jwax_theme_preference') || 'light',

    // Sync current cart modifications over to dynamic local browser registries
    syncCart() {
        localStorage.setItem('jwax_cart_manifest', JSON.stringify(this.cart));
        this.updateGlobalNavbarBadges();
    },

    // Sync current wishlist modifications over to dynamic local browser registries
    syncWishlist() {
        localStorage.setItem('jwax_wishlist_manifest', JSON.stringify(this.wishlist));
        this.updateGlobalNavbarBadges();
    },

    // Recalculate badge notifications values universally inside template nodes
    updateGlobalNavbarBadges() {
        const cartBadge = document.getElementById('cart-badge');
        const wishlistBadge = document.getElementById('wishlist-badge');

        if (cartBadge) {
            const totalItemsCount = this.cart.reduce((total, element) => total + element.qty, 0);
            cartBadge.textContent = totalItemsCount;
            cartBadge.style.display = totalItemsCount > 0 ? 'inline-block' : 'none';
        }

        if (wishlistBadge) {
            wishlistBadge.textContent = this.wishlist.length;
            wishlistBadge.style.display = this.wishlist.length > 0 ? 'inline-block' : 'none';
        }
    },

    // Switch color layout profiles safely down DOM tree branches
    toggleThemeMode() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('jwax_theme_preference', this.theme);
        showToast(`System presentation profiles switched to ${this.theme} layout context mode.`);
    }
};

window.AppState = AppState;

// 3. Centralized Toast Notification Feedback Loop Framework
function showToast(message, variant = "success") {
    let container = document.getElementById('toast-container');
    
    // Fallback structural injection wrapper anchor initialization if absent inside layout
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toastNode = document.createElement('div');
    toastNode.className = `toast-message-bubble ${variant}`;
    toastNode.innerHTML = `
        <i class="fas ${variant === 'success' ? 'fa-check-circle' : variant === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toastNode);

    // Automation clean-up cycles purging dead nodes safely from active DOM tree
    setTimeout(() => {
        toastNode.style.animation = 'toastExit 0.3s forwards ease-in';
        setTimeout(() => toastNode.remove(), 300);
    }, 4000);
}

window.showToast = showToast;

// 4. Shared Interactive Global Button Bindings
function bindProductInteractiveActionButtons() {
    // Universal Event Delegate Hook tracking manual Cart injections across grids
    document.querySelectorAll('.add-to-cart-action').forEach(button => {
        button.addEventListener('click', (event) => {
            const cardNode = event.target.closest('[data-product-id]');
            if (!cardNode) return;

            const targetProductId = cardNode.dataset.productId;
            const stockProductObj = JWAX_DATABASE.find(item => item.id === targetProductId);

            if (!stockProductObj) return;

            const existingCartElement = AppState.cart.find(item => item.id === targetProductId);
            if (existingCartElement) {
                existingCartElement.qty++;
            } else {
                AppState.cart.push({ ...stockProductObj, qty: 1 });
            }

            AppState.syncCart();
            showToast(`Asset unit assigned to workspace cart processing: ${stockProductObj.name}`);
        });
    });

    // Universal Event Delegate Hook tracking manual Wishlist allocations across grids
    document.querySelectorAll('.wishlist-floating-btn').forEach(button => {
        button.onclick = function(event) {
            event.stopPropagation();
            const cardNode = event.target.closest('[data-product-id]');
            if (!cardNode) return;

            const targetProductId = cardNode.dataset.productId;
            const savedItemIndex = AppState.wishlist.indexOf(targetProductId);

            if (savedItemIndex > -1) {
                AppState.wishlist.splice(savedItemIndex, 1);
                this.classList.remove('active');
                showToast("System reference cleared from wishlist monitoring configuration log.", "warning");
            } else {
                AppState.wishlist.push(targetProductId);
                this.classList.add('active');
                showToast("Hardware asset tracking line pinned directly to your secure wishlist.");
            }
            AppState.syncWishlist();
        };
    });
}

window.bindProductInteractiveActionButtons = bindProductInteractiveActionButtons;

// 5. Lifecycle Initialization Bootstrapper
document.addEventListener("DOMContentLoaded", () => {
    // Assert visual preference layers directly upon DOM rendering sequence milestones
    document.documentElement.setAttribute('data-theme', AppState.theme);
    AppState.updateGlobalNavbarBadges();
    bindProductInteractiveActionButtons();

    // Hook tracking system theme switch layout button if attached inside global layouts
    document.getElementById('global-theme-toggle-trigger')?.addEventListener('click', () => {
        AppState.toggleThemeMode();
    });
});