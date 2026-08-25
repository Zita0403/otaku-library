document.addEventListener("DOMContentLoaded", () => {
    const sortSelect = document.getElementById("sortGenre");
    
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            if (e.target.value) {
                window.location.href = e.target.value;
            }
        });
    }
});