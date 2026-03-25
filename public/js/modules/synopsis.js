document.addEventListener('DOMContentLoaded', () => {
    const synopsisContainer = document.querySelector('.synopsis');
    const synopsisText = document.querySelector('.synopsis-text');
    
    if (!synopsisText || !synopsisContainer) return;

    const originalText = synopsisText.innerText;
    const limit = 400; 

    if (originalText.length > limit) {
        
        synopsisText.classList.add('collapsed');

        
        const btn = document.createElement("button");
        btn.classList.add("read-more-btn");
        btn.innerText = "Read More";
        btn.type = "button";

        synopsisContainer.appendChild(btn);

        btn.addEventListener('click', () => {
            const isCollapsed = synopsisText.classList.toggle('collapsed');
            btn.innerText = isCollapsed ? 'Read More' : 'Read Less';
        });
    }
});