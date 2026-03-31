import "./modules/sakura.js"; // Canvas
import "./modules/autocomplete_list.js"; // Search autocomplete
import "./modules/mobile_menu.js"; // Mobile navigation
import "./modules/addList.js"; // Add list function
import "./modules/user_dropdown.js" // Account dropdown menu
import "./modules/synopsis.js" // Details synopsis read more 
import "./modules/mobile_search.js" // Mobile search focus
import "./modules/mobile_login.js" // Mobile login focus
import "./modules/show_more.js" // Show more lists in account page
import "./modules/admin.js" // Admin dashboard functions
import "./modules/account.js" // Account settings functions

// Global function to show custom modal

window.showModal = function(title, message, options = {}) { 
    const modal = document.getElementById('customModal');
    if (!modal) return; 

    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;

    const actionForm = document.getElementById('modalActionForm');
    const defaultFooter = document.getElementById('defaultFooter');

    // Itt kezeljük a megerősítő form megjelenítését
    if (options.isConfirm) {
        if (actionForm) actionForm.style.display = 'block';
        if (defaultFooter) defaultFooter.style.display = 'none';
    } else {
        if (actionForm) actionForm.style.display = 'none';
        if (defaultFooter) defaultFooter.style.display = 'block';
    }

    modal.style.display = 'flex';
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    const closeActions = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            if (options && typeof options.onClose === 'function') {
                options.onClose();
            }
        }, 300);
    };
    
    document.querySelector('.close-modal').onclick = closeActions;
    document.getElementById('modalCloseBtn').onclick = closeActions;
    
    const cancelBtn = document.getElementById('modalCancelBtn');
    if (cancelBtn) cancelBtn.onclick = closeActions;

    window.onclick = (event) => {
        if (event.target == modal) closeActions();
    };
}

setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.style.transition = "opacity 0.5s ease";
        alert.style.opacity = "0";
        setTimeout(() => alert.remove(), 500);
    });
}, 5000);