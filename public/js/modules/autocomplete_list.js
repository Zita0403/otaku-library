const searchInput = document.querySelector('.search');
const autocompleteList = document.getElementById('autocomplete-list');
let debounceTimer;

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);

    if (query.length < 2) {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none';
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
            const { data } = await response.json();

            autocompleteList.innerHTML = ''; 

            if (data && data.length > 0) {
                autocompleteList.style.display = 'block';
                data.forEach(anime => {
                    const item = document.createElement('a');
                    item.href = `/anime/${anime.mal_id}`;
                    item.className = 'list-group-item list-group-item-action border-0';
                    item.style.cursor = 'pointer';
                    
                    item.innerHTML = `
                        <div>
                            <img src="${anime.images.jpg.small_image_url}" style="width: 40px; height: 55px; object-fit: cover; border-radius: 4px;" class="me-3">
                            <div>
                                <div>${anime.title}</div>
                                <small class="text-muted">${anime.type} (${anime.year || 'N/A'})</small>
                            </div>
                        </div>
                    `;
                    autocompleteList.appendChild(item);
                });
            } else {
                autocompleteList.style.display = 'none';
            }
        } catch (err) {
            console.error("Hiba az autocomplete közben:", err);
        }
    }, 500); 
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none';
    }
});