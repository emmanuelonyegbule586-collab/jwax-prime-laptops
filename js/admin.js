// js/admin.js Component Sync Controller
document.addEventListener("DOMContentLoaded", () => {
    const tableTarget = document.getElementById('admin-crud-table-target');
    if(!tableTarget) return;

    tableTarget.innerHTML = `
        <thead>
            <tr style="text-align:left; border-bottom:2px solid var(--border-color);">
                <th style="padding:12px;">ID</th>
                <th>Laptop Details</th>
                <th>Brand</th>
                <th>System Value Price</th>
                <th>Actions Control</th>
            </tr>
        </thead>
        <tbody>
            ${JWAX_DATABASE.map(p => `
                <tr style="border-bottom:1px solid var(--border-color);">
                    <td style="padding:12px; font-family:monospace;">${p.id}</td>
                    <td><strong>${p.name}</strong><br><small style="color:var(--text-light)">${p.processor}</small></td>
                    <td>${p.brand}</td>
                    <td>₦${p.price.toLocaleString()}</td>
                    <td>
                        <button onclick="deleteRowElement('${p.id}')" style="color:var(--danger); cursor:pointer;"><i class="fas fa-trash-alt"></i> Wipe</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
});

window.deleteRowElement = function(id) {
    showToast(`Simulation Warning: In production, row execution entry ${id} will trigger a safe database removal routine cascade.`, "danger");
};