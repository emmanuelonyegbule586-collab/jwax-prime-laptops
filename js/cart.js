/**
 * Jwax Prime Laptops - Core Cart Logic Engine
 */

function calculateOperationalCartBill() {
    const cartTarget = document.getElementById('cart-items-table-body');
    const subtotalDisplay = document.getElementById('summary-subtotal');
    const deliveryDisplay = document.getElementById('summary-delivery');
    const grandtotalDisplay = document.getElementById('summary-grandtotal');

    let subtotal = AppState.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    // Check for active coupon adjustments stored dynamically in session state
    let discountAmount = 0;
    if(sessionStorage.getItem('jwax_active_coupon') === 'PRIME10') {
        discountAmount = subtotal * 0.10;
        subtotal = subtotal - discountAmount;
        showToast("Coupon 'PRIME10' (-10%) applied successfully to order structure.", "success");
    }

    const deliveryFee = subtotal > 1000000 || subtotal === 0 ? 0 : 15000;
    const grandTotal = subtotal + deliveryFee;

    if (cartTarget) {
        if (AppState.cart.length === 0) {
            cartTarget.innerHTML = `<tr><td colspan="5" class="empty-cart-row-state">Your procurement pipeline is empty. <br><br><a href="products.html" class="btn btn-primary">Browse Premium Inventory</a></td></tr>`;
        } else {
            cartTarget.innerHTML = AppState.cart.map(item => `
                <tr class="cart-data-row">
                    <td class="cart-product-cell">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h4>${item.name}</h4>
                            <small>${item.brand} • ${item.grade}</small>
                        </div>
                    </td>
                    <td class="price-cell">₦${item.price.toLocaleString()}</td>
                    <td class="qty-cell">
                        <div class="qty-stepper">
                            <button onclick="adjustQty('${item.id}', -1)" aria-label="Decrease">&minus;</button>
                            <span>${item.qty}</span>
                            <button onclick="adjustQty('${item.id}', 1)" aria-label="Increase">&plus;</button>
                        </div>
                    </td>
                    <td class="total-cell">₦${(item.price * item.qty).toLocaleString()}</td>
                    <td class="action-cell">
                        <button onclick="purgeCartElement('${item.id}')" class="item-delete-btn" aria-label="Delete"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }

    if (subtotalDisplay) subtotalDisplay.textContent = `₦${(subtotal + discountAmount).toLocaleString()}`;
    if (deliveryDisplay) deliveryDisplay.textContent = deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`;
    if (grandtotalDisplay) grandtotalDisplay.textContent = `₦${grandTotal.toLocaleString()}`;
}

window.adjustQty = function(id, delta) {
    const item = AppState.cart.find(i => i.id === id);
    if(item) {
        item.qty += delta;
        if(item.qty <= 0) {
            AppState.cart = AppState.cart.filter(i => i.id !== id);
        }
        AppState.syncCart();
        calculateOperationalCartBill();
    }
};

window.purgeCartElement = function(id) {
    AppState.cart = AppState.cart.filter(i => i.id !== id);
    AppState.syncCart();
    calculateOperationalCartBill();
    showToast("Unit removed from manifest.", "warning");
};

// Coupon Activation Controller Implementation
document.getElementById('coupon-form-submit')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('coupon-input-field').value.trim().toUpperCase();
    if (code === 'PRIME10') {
        sessionStorage.setItem('jwax_active_coupon', 'PRIME10');
        calculateOperationalCartBill();
    } else {
        showToast("Invalid commercial coupon reference code.", "danger");
    }
});

document.addEventListener("DOMContentLoaded", calculateOperationalCartBill);