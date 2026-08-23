// Checks whether an anime is adult content
export const isAdultContent = (anime) => {
    if (!anime) return false;

    const adultTerms = [
        'hentai', 'erotica', 'yaoi', 'boys love', 'boys-love', 'yuri', 'ecchi', 'shounen ai', 'shounen-ai', 'shoujo ai', 'shoujo-ai',
    ];

    // Rating check 
    const rating = anime.age_rating || anime.rating || '';
    const isAdultRating = ['Rx', 'R18', 'NC-17'].some(r => rating.includes(r));

    // Genre check 
    const categories = anime.categories || anime.genres || [];
    const hasAdultGenre = categories.some(cat => {
        const catName = (typeof cat === 'string' ? cat : cat.name || cat.slug || '').toLowerCase();
        return adultTerms.some(term => catName.includes(term));
    });

    // Explicit genre check 
    const isExplicit = anime.explicit_genres?.some(g => 
        adultTerms.some(term => g.name?.toLowerCase().includes(term))
    );

    // Title & Synopsis check
    const title = (anime.title || '').toLowerCase();
    const synopsis = (anime.synopsis || '').toLowerCase();
    const hasAdultTitle = adultTerms.some(term => title.includes(term));
    const hasAdultSynopsis = adultTerms.some(term => synopsis.includes(term));

    return !!(isAdultRating || hasAdultGenre || isExplicit || hasAdultTitle || hasAdultSynopsis);
};

// Gets a list of anime and filters out adult content based on user preferences.
export const filterAnimeList = (list, user) => {
    if (user && user.allow_nsfw) return list; 
    return list.filter(anime => !isAdultContent(anime));
}