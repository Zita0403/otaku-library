// controllers/listController.js
import db from "../db.js";

export const toggleAnime = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to use this feature!" });
    } 

    const { animeId, title, imageUrl, listType } = req.body;
    const userId = req.user.id;

        try {
        const checkResult = await db.query(
            "SELECT id FROM user_anime_lists WHERE user_id = $1 AND anime_id = $2 AND list_type = $3",
            [userId, animeId, listType]
        );

        if (checkResult.rows.length > 0) {
            await db.query(
                "DELETE FROM user_anime_lists WHERE user_id = $1 AND anime_id = $2 AND list_type = $3",
                [userId, animeId, listType]
            );
            return res.json({ success: true, action: 'removed' });
        } else {
            await db.query(
                "INSERT INTO user_anime_lists (user_id, anime_id, anime_title, anime_image, list_type) VALUES ($1, $2, $3, $4, $5)",
                [userId, animeId, title, imageUrl, listType]
            );
            return res.json({ success: true, action: 'added' });
        }
    } catch (err) {
        console.error("Database error during toggle:", err);
        res.status(500).json({ error: "Szerver hiba történt." });
    }   
}