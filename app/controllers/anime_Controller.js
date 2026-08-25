// controllers/anime_Controller.js
import axios from "axios";
import { filterAnimeList } from "../utils/nsfwFilter.js";
import db from "../db.js";

const KITSU_URL = "https://kitsu.io/api/edge";

// Transform KITSU JSON: API response structure for EJS templates
const formatKitsuAnime = (item, included = []) => {
    if (!item) return null;
    const attr = item.attributes || item;
    
    let year = 'N/A';
    let season = '';
    let seasonYearText = 'N/A';

    const startDate = attr.startDate;

    if (startDate && typeof startDate === 'string' && startDate.includes('-')) {
        const parts = startDate.split('-');
        year = parts[0]; 
        const month = parseInt(parts[1], 10); 

        if (month >= 1 && month <= 3) season = 'Winter';
        else if (month >= 4 && month <= 6) season = 'Spring';
        else if (month >= 7 && month <= 9) season = 'Summer';
        else if (month >= 10 && month <= 12) season = 'Fall';

        seasonYearText = season ? `${season} ${year}` : `${year}`;
    }

    let categoriesList = [];
    const safeIncluded = Array.isArray(included) ? included : [];
    if (item.relationships?.categories?.data) {
            const catIds = item.relationships.categories.data.map(c => c.id);
            categoriesList = safeIncluded
                .filter(inc => inc.type === 'categories' && catIds.includes(inc.id))
                .map(inc => inc.attributes?.title || inc.attributes?.slug || '');
    }

    const originalTitle = attr.titles?.ja_jp || attr.titles?.en_jp || attr.canonicalTitle || 'N/A';

    const poster = attr.posterImage;
    const imageUrl = poster?.medium || poster?.small || poster?.original || '/images/no-cover.jpg';
    const largeImageUrl = poster?.large || poster?.original || poster?.medium || '/images/no-cover.jpg';

    const ageRatingMap = {
        'G': 'General Audiences',
        'PG': 'Parental Guidance Suggested',
        'R': 'Restricted',
        'R18': 'Explicit'
    };

    let ageRatingText = 'N/A';
        if (attr.ageRating) {
            const fullRating = ageRatingMap[attr.ageRating] || attr.ageRating;
            if (attr.ageRatingGuide) {
                ageRatingText = `${fullRating} - ${attr.ageRatingGuide}`;
            } else {
                ageRatingText = fullRating;
            }
    }   

    return {
        id: item.id,
        mal_id: item.id,
        original_title: originalTitle,
        episodes: attr.episodeCount || 'N/A',
        title: attr.canonicalTitle || attr.titles?.en_jp || attr.titles?.en || 'Unknown Title',
        images: {
            jpg: {
                image_url: imageUrl,
                large_image_url: largeImageUrl
            }
        },
        score: attr.averageRating ? (parseFloat(attr.averageRating) / 10).toFixed(2) : "N/A",
        age_rating: ageRatingText,
        year: year,
        season: season,
        seasonYear: seasonYearText,
        seasonYearText: seasonYearText,
        startDate: startDate,
        type: attr.showType ? attr.showType.toUpperCase() : 'TV',
        synopsis: attr.synopsis || 'No description available',
        categories: categoriesList
    };
};

// Main page seasonal slideshow
export const getSeasonalList = async(req, res) => {
    try {
        const response = await axios.get(`${KITSU_URL}/anime`, {
            params: {
                'filter[status]': 'current',
                'sort': '-startDate',
                'page[limit]': 10,
                'include': 'categories'
            },
            headers: {'Accept': 'application/vnd.api+json'},
            timeout: 8000
        });
        const rawList = response.data.data.map(item => formatKitsuAnime(item, response.data.included || []));
        const safeSlideshow = filterAnimeList(rawList, req.user); 
        res.render("index", { 
            title: "Seasonal Anime",
            animeList: safeSlideshow, 
            anime: null, 
            error: null 
        });
    } catch (err) {
        console.error("Seasonal list error:", err.message);
        res.render("index", { 
            animeList: [], 
            anime: null, 
            error: err.message 
        });
    }
};

// Toplist
export const getToplist = async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try { 
        const response = await axios.get(`${KITSU_URL}/anime`, { 
            params: {
                'sort': '-averageRating',
                'page[limit]': limit,
                'page[offset]': offset,
                'include': 'categories'
            },
            headers: {'Accept': 'application/vnd.api+json'},
            timeout: 8000 
        });

        const rawList = response.data.data.map(item => formatKitsuAnime(item, response.data.included || []));
        const safeToplist = filterAnimeList(rawList, req.user);
        res.render("pages/top", { 
            title: "Top Rated Anime",
            animeList: safeToplist, 
            error: null 
        });
    } catch (err) {
        console.error("Toplist error:", err.message);
        res.render("pages/top", { 
            animeList: [], 
            error: err.message 
        });
    } 
};

// Details
export const getAnimeDetails = async(req, res) => {
    const animeId = req.params.id; 
    try {
        const response = await axios.get(`${KITSU_URL}/anime/${animeId}`, {
            headers: {'Accept': 'application/vnd.api+json'},
            timeout: 8000 
        });
        const animeData = formatKitsuAnime(response.data.data);

        if (!animeData) {
            return res.status(404).render("errors/404", { message: "Anime not found." });
        }

        let userStatus = {
            favorite: false,
            watched: false,
            wishlist: false
        };

        if (req.isAuthenticated()) {
            const userId = req.user.id;
            const dbResult = await db.query(
                "SELECT list_type FROM user_anime_lists WHERE user_id = $1 AND anime_id = $2",
                [userId, animeId]
            );

            dbResult.rows.forEach(row => {
                if (row.list_type === 'favorite') userStatus.favorite = true;
                if (row.list_type === 'watched') userStatus.watched = true;
                if (row.list_type === 'wishlist') userStatus.wishlist = true;
            });
        }

        res.render("pages/details", { 
            anime: animeData,
            user: req.user || null,
            status: userStatus,
            title: animeData.title, 
            description: animeData.synopsis ? animeData.synopsis.substring(0, 150).replace(/\r?\n|\r/g, " ") + "..." : "Check out this anime details!",
            ogImage: animeData.images?.jpg?.large_image_url || "https://otakulibrary.zita.dev/images/og-image.jpg",
        });
    } catch (err) {
        console.error("Error retrieving datasheet:", err.response?.data || err.message || err);
        res.status(500).render("index", { 
            anime: null, 
            animeList: [], 
            err: "Error retrieving datasheet:" 
        });
    }
}

// Search
export const searchAnime = async (req, res) => {
    const query = req.query.q; 
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length < 3) {
        return res.redirect("/"); 
    }

    try {
        const response = await axios.get(`${KITSU_URL}/anime`, {
            params: {
                'filter[text]': query,
                'page[limit]': limit,
                'page[offset]': offset,
            },
            headers: {'Accept': 'application/vnd.api+json'},
            timeout: 8000
        });

        const rawList = response.data.data.map(item => formatKitsuAnime(item, response.data.included || []));
        const safeSearch = filterAnimeList(rawList, req.user);
        const totalCount = response.data.meta.count;
        const lastPage = Math.ceil(totalCount / limit) || 1;

        res.render("pages/genre", { 
            title: `Search Results: "${query}"`,
            animeList: safeSearch,
            type: 'search',           
            searchQuery: query,       
            currentPage: page,
            lastPage: lastPage,
            hasNextPage: page < lastPage,
            baseUrl: `/search?q=${encodeURIComponent(query)}&`,
            genreId: null,            
            genreName: null,
            error: null
        });
    } catch (err) {
        console.error("Search error:", err.message);
        const kitsuErrorMessage = err.response?.data?.message;
        const errorMessage = kitsuErrorMessage 
            ? `External provider error: ${kitsuErrorMessage}`
            : "Kitsu API servers are currently unavailable.";
        res.render("pages/genre", {
            title: `Search Results: "${query}"`,
            animeList: [],
            type: 'search',
            searchQuery: query,
            currentPage: page,
            lastPage: 1,
            hasNextPage: false,
            baseUrl: `/search?q=${encodeURIComponent(query)}&`,
            genreId: null,
            genreName: null,
            error: errorMessage,
        });
    }
};

// Autocomplete list
export const getAutocomplete = async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim().length < 3) {
        return res.json([]);
    }

    try {
        const response = await axios.get(`${KITSU_URL}/anime`, {
            params: {
                'filter[text]': query,
                'page[limit]': 5,
            },
            headers: {'Accept': 'application/vnd.api+json'},
            timeout: 8000
        });
        const rawList = response.data.data.map(item => formatKitsuAnime(item, response.data.included || []));
        const safeData = filterAnimeList(rawList || [], req.user);
        res.json(safeData);
    } catch (err) {
        const kitsuErrorMessage = err.response?.data?.message || err.message;
        console.error("Autocomplete API error:", kitsuErrorMessage);
        res.status(200).json([]);
    }
};

// Genre list
export const getGenreList = async (req, res) => {
const { genreId, genreName } = req.params;  
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20; 
    const offset = (page - 1) * limit;
    
    try {
        const response = await axios.get(`${KITSU_URL}/anime`, {
            params: { 
                'filter[categories]': genreId, 
                'page[limit]': limit,
                'page[offset]': offset,
            },
            headers: {'Accept': 'application/vnd.api+json'},
            timeout: 8000
        });
        const rawList = response.data.data.map(item => formatKitsuAnime(item, response.data.included || []));
        const safeGenre = filterAnimeList(rawList, req.user);
        const totalCount = response.data.meta?.count || 0;
        const lastPage = Math.ceil(totalCount / limit) || 1;

        res.render("pages/genre", { 
            title: genreName,
            animeList: safeGenre, 
            genreName: genreName,
            genreId: genreId,
            currentPage: page,
            lastPage: lastPage,
            baseUrl: `/genre/${genreId}/${genreName}?`,
            hasNextPage: page < lastPage,
            type: 'genre',
            error:null
        });
    } catch (err) {
        console.error("Genre list error:", err.message);
        console.error("DEBUG KITSU ERROR:");
        console.error("Status:", err.response?.status);
        console.error("Data:", err.response?.data);
        const kitsuErrorMessage = err.response?.data?.message;
        const errorMessage = kitsuErrorMessage 
            ? `External provider error: ${kitsuErrorMessage}`
            : "Kitsu API servers are currently unavailable.";
        res.render("pages/genre", { 
            title: genreName,
            animeList: [], 
            genreName: genreName, 
            genreId: genreId,
            currentPage: page,
            lastPage: 1,
            baseUrl: `/genre/${genreId}/${genreName}?`,
            hasNextPage: false,
            type: 'genre',
            error: errorMessage
        });
    }    
};