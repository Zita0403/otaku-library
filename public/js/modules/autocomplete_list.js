// modules/autocomplete.js
const searchInput = document.querySelector('.search');
const autocompleteList = document.getElementById('autocomplete-list');
let debounceTimer;

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);

    if (query.length < 3) {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none';
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
            
            if (response.status === 429) {
                console.error("Too many requests - please wait.");
                return;
            }

            const data = await response.json();

            autocompleteList.innerHTML = ''; 

            if (Array.isArray(data) && data.length > 0) {
                autocompleteList.style.display = 'block';
                data.forEach(anime => {
                    const item = document.createElement('a');
                    item.href = `/anime/${anime.id}`;
                    item.className = 'list-group-item list-group-item-action border-0';
                    item.style.cursor = 'pointer';

                    const imgUrl = anime.posterImage || anime.image || anime.cover || (anime.images && anime.images.jpg && anime.images.jpg.image_url) || '/images/no-image.png';
                    const yearStr = anime.year ? `${anime.year}` : '';
                    
                    item.innerHTML = `
                        <div>
                            <img src="${imgUrl}" class="autocomplete-thumb">
                            <div>
                                <div>${anime.title}</div>
                                <small class="text-muted">${anime.type} (${yearStr || 'N/A'})</small>
                            </div>
                        </div>
                    `;
                    autocompleteList.appendChild(item);
                });
            } else {
                autocompleteList.style.display = 'none';
            }
        } catch (err) {
            console.error("Error during autocomplete:", err);
        }
    }, 500); 
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none';
    }
});