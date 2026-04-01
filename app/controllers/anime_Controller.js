// controllers/anime_Controller.js
import axios from "axios";
import { filterAnimeList } from "../utils/nsfwFilter.js";
import db from "../db.js";

const JIKAN_URL = "https://api.jikan.moe/v4";

// Main page seasonal slideshow
export const getSeasonalList = async(req, res) => {
    try {
        const response = await axios.get(`${JIKAN_URL}/seasons/now`);
        const safeSlideshow = filterAnimeList(response.data.data, req.user); 
        res.render("index", { 
            title: "Seasonal Anime",
            animeList: safeSlideshow, 
            anime: null, 
            error: null 
        });
    } catch (err) {
        res.render("index", { 
            animeList: [], 
            anime: null, 
            error: err.message 
        });
    }
};

// Toplist
export const getToplist = async(req, res) => {
    try { 
        const response = await axios.get(`${JIKAN_URL}/top/anime`);
        const safeToplist = filterAnimeList(response.data.data, req.user);
        res.render("pages/top", { 
            title: "Top Rated Anime",
            animeList: safeToplist, 
            error: null 
        });
    } catch (err) {
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
        const response = await axios.get(`${JIKAN_URL}/anime/${animeId}/full`);
        const animeData = response.data.data;

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
        console.error("Error retrieving datasheet:", err);
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

    if (!query || query.trim().length < 3) {
        return res.redirect("/"); 
    }

    try {
        const response = await axios.get(`${JIKAN_URL}/anime`, {
            params: {
                q: query,
                page: page,
                limit: limit
            }
        });

        const safeSearch = filterAnimeList(response.data.data, req.user);
        const pagination = response.data.pagination;

        res.render("pages/genre", { 
            title: `Search Results: "${query}"`,
            animeList: safeSearch,
            type: 'search',           
            searchQuery: query,       
            currentPage: page,
            lastPage: pagination.last_visible_page,
            hasNextPage: pagination.has_next_page,
            genreId: null,            
            genreName: null,
            error: null
        });
    } catch (err) {
        console.error("Search error:", err);
        res.render("pages/genre", {
            title: `Category: ${genreName}`,
            animeList: [],
            error: "Something went wrong during search.",
        });
    }
};

// Autocomplete list
export const getAutocomplete = async (req, res) => {
    try {
        const response = await axios.get(`${JIKAN_URL}/anime?q=${encodeURIComponent(req.query.q)}&limit=5`);
        const safeData = filterAnimeList(response.data.data, req.user);
        res.json({ data: safeData });
    } catch (err) {
        res.status(500).json({ error: "Hiba" });
    }
};

// Genre list
export const getGenreList = async (req, res) => {
const { genreId, genreName } = req.params;  
    const page = parseInt(req.query.page) || 1;
    const limit = 20; 
    
    try {
        const response = await axios.get(`${JIKAN_URL}/anime`, {
            params: { 
                genres: genreId, 
                page: page,
                limit: limit,
                order_by: "score",
                sort: "desc" 
            }
        });
        const safeGenre = filterAnimeList(response.data.data, req.user);
        const pagination = response.data.pagination;
        res.render("pages/genre", { 
            title: `Category: ${genreName}`,
            animeList: safeGenre, 
            genreName: genreName,
            genreId: genreId,
            currentPage: page,
            lastPage: pagination.last_visible_page,
            hasNextPage: pagination.has_next_page,
            type: 'genre',
            error:null
        });
    } catch (err) {
        res.render("pages/genre", { 
            animeList: [], 
            genreName, 
            genreId: genreId,
            currentPage: page,
            hasNextPage: false,
            error: err.message 
        });
    }    
};