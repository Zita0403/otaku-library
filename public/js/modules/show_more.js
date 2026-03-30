// modules/show_more.js
// This module handles slider functionality for the "list-container" sections in the account page
document.querySelectorAll('.slider-wrapper').forEach(wrapper => {
    const row = wrapper.querySelector('.anime-scroll-row');
    const leftArrow = wrapper.querySelector('.left-arrow');
    const rightArrow = wrapper.querySelector('.right-arrow');

    if (row && rightArrow && leftArrow) {
        rightArrow.addEventListener('click', () => {
            row.scrollBy({ left: row.clientWidth + 15, behavior: 'smooth' });
        });

        leftArrow.addEventListener('click', () => {
            row.scrollBy({ left: -(row.clientWidth + 15), behavior: 'smooth' });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.slider-wrapper');

    sliders.forEach(wrapper => {
        const row = wrapper.querySelector('.anime-scroll-row');
        const leftArrow = wrapper.querySelector('.left-arrow');
        const rightArrow = wrapper.querySelector('.right-arrow');

        const checkOverflow = () => {
            if (row.scrollWidth > row.clientWidth) {
                leftArrow?.classList.add('is-visible');
                rightArrow?.classList.add('is-visible');
            } else {
                leftArrow?.classList.remove('is-visible');
                rightArrow?.classList.remove('is-visible');
            }
        };

        checkOverflow();

        window.addEventListener('resize', checkOverflow);

        rightArrow?.addEventListener('click', () => {
            row.scrollBy({ left: row.clientWidth, behavior: 'smooth' });
        });

        leftArrow?.addEventListener('click', () => {
            row.scrollBy({ left: -row.clientWidth, behavior: 'smooth' });
        });
    });
});