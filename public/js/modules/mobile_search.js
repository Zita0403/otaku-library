// modules/mobile_search.js
// This module handles the mobile search functionality, allowing users to focus on the search input when the search button is clicked.
const searchBtn = document.querySelector('.search-button');
const searchInput = document.querySelector('.search');

if (searchBtn && searchInput) { 
    searchBtn.addEventListener('click', () => {
        searchInput.focus();
    });             
}