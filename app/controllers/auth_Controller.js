// controllers/authController.js
import db from "../db.js";
import bcrypt from "bcrypt";
import passport from "passport";

// Register
export const register = async(req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const checkResult = await db.query("SELECT id FROM users WHERE email = $1", [email]);

        if (checkResult.rows.length > 0) {
            return res.render("auth/login", { error: "This email is already in use." });
        } 

        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);

        const result = await db.query(
            "INSERT INTO users (user_name, email, password_hash, allow_nsfw) VALUES ($1, $2, $3, $4) RETURNING *",[username, email, hash, false] 
        );

        const user = result.rows[0];
        req.login(user, (err) => {
            if (err) return next(err);
            res.redirect("/auth/account");
        });
    } catch (err) {
        console.error("Error in register:", err);
        next(err);
    }
}

// Login
export const login = passport.authenticate("local", {
    successRedirect: "/auth/account",
    failureRedirect: "/login",
});

// Logout
export const logout = async (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            console.error("Logout error:", err);
            return next(err); 
        }

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
                return next(err);
            }

            res.clearCookie('connect.sid'); 

            res.redirect("/"); 
        });
    });
}

// GET login page 
export const getLoginPage = (req, res) => {
    const errorMessage = req.query.error === 'invalid_credentials' 
        ? "Incorrect username or password!" 
        : null;
        
    res.render("auth/login", { error: errorMessage, user: req.user });
};

// GET register page 
export const getRegisterPage = (req, res) => {
    res.render("auth/register", { user: req.user });
};

// GET account page
export const accountPage = async (req, res) => {
if (req.isAuthenticated()) {
        try {
            const result = await db.query(
                "SELECT * FROM user_anime_lists WHERE user_id = $1 ORDER BY created_at DESC",
                [req.user.id]
            );
            
            const lists = {
                favorite: result.rows.filter(item => item.list_type === 'favorite'),
                watched: result.rows.filter(item => item.list_type === 'watched'),
                wishlist: result.rows.filter(item => item.list_type === 'wishlist')
            };

            res.render("auth/account", { user: req.user, lists: lists });
        } catch (err) {
            console.error(err);
            res.render("auth/account", { user: req.user, lists: { favorite: [], watched: [], wishlist: [] } });
        }
    } else {
        res.redirect("/auth/login");
    }
};

// Adult content 
export const toggleNSFW = async (req, res) => {
if (!req.isAuthenticated()) {
        return res.status(401).send("Log in to make changes!");
    }

    try {
        const result = await db.query(
            "UPDATE users SET allow_nsfw = NOT allow_nsfw WHERE id = $1 RETURNING allow_nsfw",
            [req.user.id]
        );
        req.user.allow_nsfw = result.rows[0].allow_nsfw;

        res.redirect("/auth/account");
    } catch (err) {
        console.error("Error when switching NSFW:", err);
        res.status(500).send("An error occurred during the save.");
    }
};