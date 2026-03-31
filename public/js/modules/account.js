// public/js/account.js
document.addEventListener('DOMContentLoaded', () => {
    const deleteBtn = document.getElementById('btnDeleteAccount');

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (typeof window.showModal === 'function') {
                window.showModal(
                    'Account Deletion', 
                    'Warning: This cannot be undone. Enter your password to confirm.', 
                    { isConfirm: true }
                );
            }
        });
    }
});