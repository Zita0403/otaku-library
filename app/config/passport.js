// config/passport.js
import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "../db.js";

export default function(passport) { 
    // Local Strategy 
    passport.use(new Strategy(async function verify(username, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE user_name = $1", [
                username,
            ]);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const storedHashedPassword = user.password_hash;
                bcrypt.compare(password, storedHashedPassword, (err, result) => {
                    if (err) {
                        return cb(err);
                    } else {
                        if (result) {
                            return cb(null, user);
                        } else {
                            return cb(null, false, { message: "Incorrect username or password." });
                        }
                    }
                });
            } else {
                return cb(null, false, { message: "User not found. Please register first!" });
            }
        } catch (err) {
            return cb(err);
        }    
    }));

    passport.serializeUser((user, cb) => {
        cb(null, user.id);
    });

    passport.deserializeUser(async (id, cb) => {
        try {
            const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                cb(null, user);
            } else {
                cb(null, false);
            }
        } catch (err) {
            cb(err);
        }
    });
}