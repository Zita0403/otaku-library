// modules/mobile_menu.js
// Mobile navigation sub-menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.querySelector('.sub-mobile-nav-toggle');
    const subMenu = document.querySelector('.sub-mobile-nav');

    if (toggleBtn && subMenu) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            subMenu.classList.toggle('active');
        });

        subMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    document.addEventListener('click', () => {
        if (subMenu && subMenu.classList.contains('active')) {
            subMenu.classList.remove('active');
        }
    });
});