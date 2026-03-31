// controllers/authController.js
import db from "../db.js";
import bcrypt from "bcrypt";
import passport from "passport";

// Register
export const register = async(req, res, next) => {
    const { username, email, password, inviteCode } = req.body;

    try {   
        const userCountRes = await db.query('SELECT COUNT(*) FROM users');

        if (parseInt(userCountRes.rows[0].count) >= 50) {
            return res.status(403).send("Sajnáljuk, a könyvtár megtelt!");
        }

        // Check invite code
        const codeRes = await db.query(
            'SELECT * FROM invite_codes WHERE code = $1', 
            [inviteCode.toUpperCase()]
        );

        if (codeRes.rows.length === 0) {
            return res.status(401).send("Érvénytelen vagy már felhasznált meghívó kód!");
        }

        const checkResult = await db.query("SELECT id FROM users WHERE email = $1", [email]);

        if (checkResult.rows.length > 0) {
            return res.render("auth/register", { error: "This email is already in use." });
        } 

        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);

        const result = await db.query(
            "INSERT INTO users (user_name, email, password_hash, allow_nsfw) VALUES ($1, $2, $3, $4) RETURNING *",[username, email, hash, false] 
        );

        await db.query('DELETE FROM invite_codes WHERE code = $1', [inviteCode.toUpperCase()]);

        const user = result.rows[0];
        req.login(user, (err) => {
            if (err) return next(err);
            res.redirect("/auth/account");
        });
        
    } catch (err) {
        console.error("Error in register:", err);
        next(err);
    }
};

// Login
export const login = passport.authenticate("local", {
    successRedirect: "/auth/account",
    failureRedirect: "/auth/login",
    failureFlash: true
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

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.is_admin === true) {
        return next(); 
    }
    
    res.status(403).send("Oops! Only admins can enter here.");
};

// GET login page 
export const getLoginPage = (req, res) => {
    const flashError = req.flash("error");
    
    let errorMessage = null;
    if (flashError && flashError.length > 0) {
        errorMessage = flashError[0]; 
    } else if (req.query.error === 'invalid_credentials') {
        errorMessage = "Incorrect username or password!";
    }

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

// Delete account
export const deleteAccount = async (req, res, next) => {

    if (req.user.is_admin) {
        return res.status(403).send("Admin accounts cannot be deleted!");
    }

    const { password } = req.body;
    const userId = req.user.id;

    try {
        const userRes = await db.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
        const user = userRes.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.redirect("/auth/account?error=wrong_password");
        }

        await db.query("DELETE FROM users WHERE id = $1", [userId]);

        req.logout((err) => {
            if (err) return next(err);
            req.session.destroy(() => {
                res.clearCookie('connect.sid');
                res.redirect('/');
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred.");
    }
};

export const getPrivacyPage = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT content, updated_at FROM site_settings WHERE key = $1", 
            ['privacy_policy']
        );
        
        const policy = result.rows[0] || { content: "Privacy Policy is under construction.", updated_at: new Date() };
        
        res.render("pages/privacy", { 
            content: policy.content, 
            lastUpdated: policy.updated_at,
            user: req.user || null 
        });
    } catch (err) {
        console.error("Error loading Privacy Policy:", err);
        res.status(500).send("An error occurred while loading the page.");
    }
};