import "./modules/sakura.js"; // Canvas
import "./modules/autocomplete_list.js"; // Search autocomplete
import "./modules/mobile_menu.js"; // Mobile navigation
import "./modules/addList.js"; // Add list function
import "./modules/user_dropdown.js" // Account dropdown menu
import "./modules/synopsis.js" // Details synopsis read more 
import "./modules/mobile_search.js" // Mobile search focus
import "./modules/mobile_login.js" // Mobile login focus
import "./modules/show_more.js" // Show more lists in account page

window.showModal = function(title, message, onCloseCallback) { 
    const modal = document.getElementById('customModal');
    if (!modal) return; 

    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;

    modal.style.display = 'flex';
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    const closeActions = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            if (typeof onCloseCallback === 'function') {
                onCloseCallback();
            }
        }, 300);
    };
    
    document.querySelector('.close-modal').onclick = closeActions;
    document.getElementById('modalCloseBtn').onclick = closeActions;
    
    window.onclick = (event) => {
        if (event.target == modal) closeActions();
    };
}
