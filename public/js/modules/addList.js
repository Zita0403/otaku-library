async function toggleList(animeId, title, imageUrl, listType, buttonElement) {
    try {
        const response = await fetch('/api/list/toggle', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ animeId, title, imageUrl, listType })
        });

        if (response.status === 401) {
            window.showModal(
                'Error!', 
                'You must be logged in to use this feature!', 
                () => {
                    window.location.href = '/auth/login';
                }
            );
            return;
        }

        const result = await response.json();

        if (response.ok) {
            const isActive = buttonElement.classList.toggle('active');
            
            const icon = buttonElement.querySelector('i');
            if (listType === 'favorite') {
                icon.classList.toggle('fa-solid');
                icon.classList.toggle('fa-regular');
            }
            if (listType === 'watched') {
                if (isActive) {
                    icon.classList.replace('fa-regular', 'fa-solid');
                    icon.classList.replace('fa-circle', 'fa-circle-check');
                } else {
                    icon.classList.replace('fa-solid', 'fa-regular');
                    icon.classList.replace('fa-circle-check', 'fa-circle');
                }
            }

            if (listType === 'wishlist') {
                icon.classList.toggle('fa-solid');
                icon.classList.toggle('fa-regular');
            }
        } else {
            console.error('Error:', result.error);
        }
    } catch (err) {
        console.error('Network error:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-toggle');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const animeId = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');
            const imageUrl = btn.getAttribute('data-image');
            const listType = btn.getAttribute('data-type');
            
            toggleList(animeId, title, imageUrl, listType, btn);
        });
    });
});