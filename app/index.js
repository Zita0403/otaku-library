// Built-in Node.js modules
import path from "path";
import { fileURLToPath } from 'url';

// Third-party libraries
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import helmet from 'helmet';
import passport from 'passport';

// My modules and configurations
import db from "./db.js";
import passportConfig from "./config/passport.js";
import * as listController from "./controllers/list_Controller.js";
import * as authController from "./controllers/auth_Controller.js";
import * as animeController from "./controllers/anime_Controller.js";

// Express app setup
const app = express();
const port = 3000;

/** -- Basic Settings -- **/ 
// Static files setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Body parser setup & EJS view engine setup fetch JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": [
            "'self'", 
            "'unsafe-inline'", 
            "https://fonts.googleapis.com", 
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com" 
        ],
        "img-src": ["'self'", "data:", "https://myanimelist.net", "https://cdn.myanimelist.net"],
        "connect-src": ["'self'", "https://api.jikan.moe"],
        "font-src": [
            "'self'", 
            "https://fonts.gstatic.com", 
            "https://cdn.jsdelivr.net", 
            "https://cdnjs.cloudflare.com" 
        ],
      },
    },
  })
);

/** Session and Authentication */
// Session store setup
const PostgreSqlStore = pgSession(session);

app.use(session({
    store: new PostgreSqlStore({
        pool: db,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production'
    } 
}));

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Own middleware to cache genres
let cachedGenres = null;

app.use(async (req, res, next) => {
    try {
        if (!cachedGenres) {
            const response = await axios.get("https://api.jikan.moe/v4/genres/anime");
            cachedGenres = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
        }
        res.locals.genres = cachedGenres;
        next(); 
    } catch (err) {
        console.error("Middleware hiba:", err.message);
        res.locals.genres = [];
        next(); 
    }
});

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

/** Auth routes **/ 
app.get("/auth/register", authController.getRegisterPage); // GET register page
app.get("/auth/login", authController.getLoginPage); // GET login page
app.get("/auth/logout", authController.logout); // GET Logout page
app.post("/auth/register", authController.register); // Register
app.post("/auth/login", authController.login); // Login

/** Account & settings **/
app.get("/auth/account", authController.accountPage); // Account
app.post("/auth/toggle-nsfw", authController.toggleNSFW); // Adult content 

/** Anime routes **/ 
app.get("/", animeController.getSeasonalList); // GET main page with slideshow
app.get("/top", animeController.getToplist); // GET toplist
app.get("/anime/:id", animeController.getAnimeDetails); // GET series details 
app.get("/genre/:genreId/:genreName", animeController.getGenreList); // GET genre list with pagination
app.get("/api/autocomplete", animeController.getAutocomplete); // Autocomplete API
app.post("/search", animeController.searchAnime); // Search

/** List actions **/
app.post("/api/list/toggle", listController.toggleAnime); // Add/remove new anime

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("index", { 
        anime: null, 
        animeList: [], 
        error: "Something went wrong on the server. Please try again later!" 
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});