/**
 * Jwax Prime Laptops - Catalog & Filtering Engine
 */

document.addEventListener("DOMContentLoaded", () => {
    // Current filter configurations state
    const filters = {
        brand: 'all',
        category: 'all',
        ram: 'all',
        price: 2000000
    };

    let activeSorting = 'default';
    let currentPage = 1;
    const itemsPerPage = 3;

    // UI Element References
    const catalogGrid = document.getElementById('catalog-rendering-target');
    const priceRange = document.getElementById('filter-price-range');
    const priceReadout = document.getElementById('price-range-readout');
    const brandSelect = document.getElementById('filter-brand-select');
    const catSelect = document.getElementById('filter-category-select');
    const ramSelect = document.getElementById('filter-ram-select');
    const sortSelect = document.getElementById('catalog-sort-select');
    const paginationWrapper = document.getElementById('pagination-container');

    // Parse URL parameter flags if coming from Home/Footer links
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('cat')) {
        filters.category = urlParams.get('cat');
        if(catSelect) catSelect.value = filters.category;
    }

    function renderCatalogPipeline() {
        if (!catalogGrid) return;

        // 1. Apply Multi-Layer Filtering
        let products = JWAX_DATABASE.filter(item => {
            const matchesBrand = filters.brand === 'all' || item.brand === filters.brand;
            const matchesCat = filters.category === 'all' || item.category === filters.category;
            const matchesRam = filters.ram === 'all' || item.ram.includes(filters.ram);
            const matchesPrice = item.price <= filters.price;
            return matchesBrand && matchesCat && matchesRam && matchesPrice;
        });

        // 2. Apply Sorting Logic
        if (activeSorting === 'price-low') {
            products.sort((a, b) => a.price - b.price);
        } else if (activeSorting === 'price-high') {
            products.sort((a, b) => b.price - a.price);
        }

        // 3. Apply Pagination Calculations
        const totalItems = products.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        // Clamp current page bounds
        if (currentPage > totalPages) currentPage = totalPages;
        
        const startOffset = (currentPage - 1) * itemsPerPage;
        const paginatedProducts = products.slice(startOffset, startOffset + itemsPerPage);

        // 4. Render Interface Markup
        if(paginatedProducts.length === 0) {
            catalogGrid.innerHTML = `<div class="no-results-notice">No premium UK used units match your precise diagnostic filters.</div>`;
            if(paginationWrapper) paginationWrapper.innerHTML = '';
            return;
        }

        catalogGrid.innerHTML = paginatedProducts.map(product => `
            <article class="product-card-blueprint" data-product-id="${product.id}">
                <div class="product-image-frame">
                    <span class="badge-discount-tag">-${product.discount}% OFF</span>
                    <button class="wishlist-floating-btn ${AppState.wishlist.includes(product.id) ? 'active' : ''}" aria-label="Save Item"><i class="fas fa-heart"></i></button>
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <button class="quick-view-overlay-btn"><i class="fas fa-eye"></i> Quick View</button>
                </div>
                <div class="product-details-content">
                    <span class="product-meta-brand">${product.brand} • ${product.grade}</span>
                    <h3 class="product-title-heading" style="cursor:pointer;" onclick="navigateToDetail('${product.id}')">${product.name}</h3>
                    <div class="product-specs-pill-row">
                        <span class="spec-pill">${product.ram} RAM</span>
                        <span class="spec-pill">${product.storage}</span>
                        <span class="spec-pill">${product.processor}</span>
                    </div>
                    <div class="product-pricing-row">
                        <span class="price-current">₦${product.price.toLocaleString()}</span>
                        <span class="price-slashed">₦${product.slashedPrice.toLocaleString()}</span>
                    </div>
                    <button class="product-action-footer-btn add-to-cart-action"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
                </div>
            </article>
        `).join('');

        renderPaginationControls(totalPages);
        bindProductInteractiveActionButtons();
        bindQuickViewModals();
    }

    function renderPaginationControls(totalPages) {
        if (!paginationWrapper) return;
        let html = '';
        for(let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.setCatalogPage(${i})">${i}</button>`;
        }
        paginationWrapper.innerHTML = html;
    }

    window.setCatalogPage = function(pageNumber) {
        currentPage = pageNumber;
        renderCatalogPipeline();
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    window.navigateToDetail = function(id) {
        localStorage.setItem('jwax_selected_product', id);
        window.location.href = 'product-details.html';
    };

    // Quick View Modal Core Infrastructure Hook
    function bindQuickViewModals() {
        document.querySelectorAll('.quick-view-overlay-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pid = e.target.closest('.product-card-blueprint').dataset.productId;
                const product = JWAX_DATABASE.find(p => p.id === pid);
                if(!product) return;

                const modal = document.createElement('div');
                modal.className = 'quick-view-modal-backdrop';
                modal.innerHTML = `
                    <div class="quick-view-modal-content">
                        <button class="modal-close-btn">&times;</button>
                        <div class="modal-body-split">
                            <div class="modal-img-container"><img src="${product.image}"></div>
                            <div class="modal-info-container">
                                <h2>${product.name}</h2>
                                <p class="brand-tag">Brand: ${product.brand} | Diagnostic Grade: ${product.grade}</p>
                                <hr style="margin:15px 0; border:0; border-top:1px solid var(--border-color);">
                                <ul style="margin-bottom:20px; display:flex; flex-direction:column; gap:8px;">
                                    <li><strong>Processor:</strong> ${product.processor}</li>
                                    <li><strong>Memory Layout:</strong> ${product.ram}</li>
                                    <li><strong>Storage Drive:</strong> ${product.storage}</li>
                                </ul>
                                <h3 style="font-size:1.8rem; color:var(--text-primary); margin-bottom:20px;">₦${product.price.toLocaleString()}</h3>
                                <button class="btn btn-primary" onclick="injectItemFromModal('${product.id}')"><i class="fas fa-shopping-cart"></i> Add Directly To Cart</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
                modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove(); });
            });
        });
    }

    window.injectItemFromModal = function(pid) {
        const targetItem = JWAX_DATABASE.find(p => p.id === pid);
        const existing = AppState.cart.find(item => item.id === pid);
        if (existing) { existing.qty++; } else { AppState.cart.push({ ...targetItem, qty: 1 }); }
        AppState.syncCart();
        showToast(`${targetItem.name} added safely to cart!`);
        document.querySelector('.quick-view-modal-backdrop')?.remove();
    };

    // Event Registration Configurations
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            filters.price = parseInt(e.target.value);
            priceReadout.textContent = `₦${filters.price.toLocaleString()}`;
            currentPage = 1;
            renderCatalogPipeline();
        });
    }
    if (brandSelect) brandSelect.addEventListener('change', (e) => { filters.brand = e.target.value; currentPage = 1; renderCatalogPipeline(); });
    if (catSelect) catSelect.addEventListener('change', (e) => { filters.category = e.target.value; currentPage = 1; renderCatalogPipeline(); });
    if (ramSelect) ramSelect.addEventListener('change', (e) => { filters.ram = e.target.value; currentPage = 1; renderCatalogPipeline(); });
    if (sortSelect) sortSelect.addEventListener('change', (e) => { activeSorting = e.target.value; renderCatalogPipeline(); });

    // Bootstrap Pipeline execution
    renderCatalogPipeline();
});