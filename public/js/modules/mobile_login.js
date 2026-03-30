// modules/mobile_login.js
// This module handles the mobile login menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const mobileLogin = document.querySelector('.mobile-nav-toggle');
    const mobileIcon = mobileLogin ? mobileLogin.querySelector('i') : null;
    const mobileMenu = document.querySelector('.auth-group');

    if (mobileLogin && mobileMenu) {
        mobileLogin.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            
            mobileMenu.classList.toggle('show-auth');
            if (mobileIcon) {
                mobileIcon.classList.toggle('rotated');
            }
        });

        document.addEventListener('click', (e) => {
            if (!mobileLogin.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('show-auth');
            }
        });
    }
});