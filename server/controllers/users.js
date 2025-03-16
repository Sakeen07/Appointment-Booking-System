import connection from '../database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register
export const register = async (req, res) => {
    const { Username, Email_Address, Password } = req.body;

    if (!Username || !Email_Address || !Password) {
        return res.status(400).json({ message: 'Username, Email Address, and Password are required' });
    }

    const q = "SELECT * FROM Register WHERE Email_Address = ? OR Username = ?";

    connection.query(q, [Email_Address, Username], (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (result.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(Password, salt);

        const insertQuery = "INSERT INTO Register (Username, Email_Address, Password) VALUES (?, ?, ?)";
        const values = [Username, Email_Address, hashedPassword];

        connection.query(insertQuery, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            return res.status(201).json({ message: "User created" });
        });
    });
}

// Login
export const login = async (req, res) => {
    const { Email_Address, Password } = req.body;

    const q = "SELECT * FROM Register WHERE Email_Address = ?";

    connection.query(q, [Email_Address], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result[0];
        const isPasswordCorrect = bcrypt.compareSync(Password, user.Password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Create token with user ID
        const token = jwt.sign(
            { id: user.UserID },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );

        const { Password: userPassword, ...userData } = user;

        res.status(200).json({
            ...userData,
            token: token,
            UserID: user.UserID
        });
    });
};

// Logout
export const logout = async (req, res) => {
    res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "User logged out" });
}
