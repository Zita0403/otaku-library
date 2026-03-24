// Account dropdown menu

document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('#account-login');
    const trigger = document.querySelector('.dropdown-trigger');

    if (dropdown && trigger) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
});