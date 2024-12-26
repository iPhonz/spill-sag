export function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    // Implement search functionality here
    // This could involve filtering articles or making API calls
    console.log('Searching for:', searchTerm);
}