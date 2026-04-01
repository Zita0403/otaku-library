import sendInvite from "../utils/mailer.js";
import db from '../db.js';
import { title } from "process";

export const getDashboard = async (req, res) => {
    try {
        const invites = await db.query('SELECT * FROM invite_codes ORDER BY created_at DESC');
        const privacyRes = await db.query(
            "SELECT content FROM site_settings WHERE key = $1", 
            ['privacy_policy']
        );
        res.render('auth/dashboard', {
            title: "Admin Dashboard", 
            user: req.user, 
            invites: invites.rows,
            privacyContent: privacyRes.rows[0] ? privacyRes.rows[0].content : "",
            success: req.query.success 
        });
    } catch (err) {
        console.error("Admin Dashboard error:", err);
        res.status(500).send("Error loading dashboard.");
    }
};

export const postInvite = async (req, res) => {
    const { email } = req.body;
    try {
        await sendInvite(email);
        res.redirect('/auth/dashboard?success=1');
    } catch (err) {
        console.error("Invite sending error:", err);
        res.status(500).send("Error occurred while sending the invite.");
    }
};

export const deleteInvite = async (req, res) => {
    const { code } = req.params;
    try {
        await db.query('DELETE FROM invite_codes WHERE code = $1', [code]);
        res.redirect('/auth/dashboard?deleted=1');
    } catch (err) {
        console.error("Error while deleting code:", err);
        res.status(500).send("Error occurred while deleting the code.");
    }
};

export const updatePrivacy = async (req, res) => {
    const { content } = req.body;
    try {
        await db.query(
            "UPDATE site_settings SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2",
            [content, 'privacy_policy']
        );
        res.redirect('/auth/dashboard?success=policy_updated');
    } catch (err) {
        console.error("Error updating privacy policy:", err);
        res.status(500).send("Failed to update policy.");
    }
};