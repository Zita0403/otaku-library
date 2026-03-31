import nodemailer from 'nodemailer';
import crypto from 'crypto';
import db from '../db.js';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendInvite = async (targetEmail) => {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    try {
        // Store the invite code in the database
        await db.query(
            'INSERT INTO invite_codes (code, email) VALUES ($1, $2)',
            [code, targetEmail]
        );

        // Send the email with the invite code
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: 'Invitation to the Otaku Library!',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #6c5ce7;">Hello!</h1>
                    <p>You have been invited to the private Otaku Library.</p>
                    <p>The one-time code for registration:</p>
                    <div style="background: #f1f2f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #ff4757;">
                        ${code}
                    </div>
                    <p>You can register here: <a href="${process.env.BASE_URL}/auth/register">${process.env.BASE_URL}/auth/register</a></p>
                    <small>The code can only be used once!</small>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true, code };
    } catch (error) {
        console.error('Error sending invitation:', error);
        throw error;
    }
};

export default sendInvite;