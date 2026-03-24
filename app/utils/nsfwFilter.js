// Checks whether an anime is adult content
export const isAdultContent = (anime) => {
    if (!anime) return false;
    // Rating check 
    const isAdultRating = anime.rating?.includes('Rx');
    // Genre check 
    const hasAdultGenre = anime.genres?.some(g => 
        g.name === 'Hentai' || g.name === 'Erotica'
    );
    // Explicit genre check 
    const isExplicit = anime.explicit_genres?.some(g => 
        g.name === 'Hentai' || g.name === 'Erotica'
    );
    return !!(isAdultRating || hasAdultGenre || isExplicit);
};

// Gets a list of anime and filters out adult content based on user preferences.
export const filterAnimeList = (list, user) => {
    if (user && user.allow_nsfw) return list; 
    return list.filter(anime => !isAdultContent(anime));
}