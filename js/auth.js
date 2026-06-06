/**
 * Jwax Prime Laptops - Authentication Matrix Controller
 */

document.addEventListener("DOMContentLoaded", () => {
    const authContainer = document.getElementById('auth-card-flipper');
    const showRegister = document.getElementById('switch-to-register');
    const showLogin = document.getElementById('switch-to-login');
    const passToggle = document.getElementById('toggle-password-visibility');
    const mainPassInput = document.getElementById('login-password-input');

    if (showRegister && authContainer) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            authContainer.classList.add('register-mode-active');
        });
    }

    if (showLogin && authContainer) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            authContainer.classList.remove('register-mode-active');
        });
    }

    if (passToggle && mainPassInput) {
        passToggle.addEventListener('click', () => {
            const isPass = mainPassInput.type === 'password';
            mainPassInput.type = isPass ? 'text' : 'password';
            passToggle.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }

    // Dynamic Mock Form Authentication Submission handling
    document.getElementById('login-form-element')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast("Access configuration authorized. Redirecting to account portal...", "success");
        setTimeout(() => window.location.href = 'index.html', 1500);
    });
});