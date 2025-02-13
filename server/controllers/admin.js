import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import connection from '../database.js';

dayjs.extend(customParseFormat);

// Admin Login
export const adminLogin = async (req, res) => {
    const { Email_Address, Password } = req.body;

    const q = "SELECT * FROM Admin WHERE Email_Address = ?";

    connection.query(q, [Email_Address], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const admin = result[0];
        const isPasswordCorrect = bcrypt.compareSync(Password, admin.Password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Create token with admin ID
        const token = jwt.sign(
            { id: admin.AdminID, isAdmin: true },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );

        const { Password: adminPassword, ...adminData } = admin;

        res.status(200).json({
            ...adminData,
            token: token,
            AdminID: admin.AdminID
        });
    });
};

// Get All Appointments
export const getAllAppointments = async (req, res) => {
    const q = `
        SELECT 
            a.*,
            DATE_FORMAT(a.Date, '%Y-%m-%d') as Date,
            TIME_FORMAT(a.Time, '%H:%i:%s') as Time,
            r.Username 
        FROM Appointments a 
        JOIN Register r ON a.UserID = r.UserID 
        ORDER BY a.Date DESC, a.Time DESC
    `;

    connection.query(q, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: err.message });
        }
        console.log('All appointments fetched from database:', result);
        return res.status(200).json(result);
    });
};

// Edit Appointment Time/Date
export const editAppointment = async (req, res) => {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
        return res.status(400).json({ message: 'Date and Time are required' });
    }

    // Check for existing appointments at the new time (excluding the current appointment)
    const checkQuery = "SELECT COUNT(*) as count FROM Appointments WHERE Date = ? AND Time = ? AND AppointmentID != ?";
    
    connection.query(checkQuery, [date, time, id], (checkErr, checkResult) => {
        if (checkErr) {
            return res.status(500).json({ message: checkErr.message });
        }

        if (checkResult[0].count > 0) {
            return res.status(409).json({ 
                message: 'This time slot is already booked. Please select a different time.' 
            });
        }

        // If no conflicts, proceed with update
        const updateQuery = "UPDATE Appointments SET `Date` = ?, `Time` = ? WHERE `AppointmentID` = ?";
        const values = [date, time, id];

        connection.query(updateQuery, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Appointment not found" });
            }
            return res.status(200).json({ message: "Appointment updated" });
        });
    });
};

// Delete Appointment
export const deleteAppointment = async (req, res) => {
    const { id } = req.params;

    const q = "DELETE FROM Appointments WHERE `AppointmentID` = ?";

    connection.query(q, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        return res.status(200).json({ message: "Appointment deleted" });
    });
};

// Register Admin
export const registerAdmin = async (req, res) => {
    try {
        const { Admin_Name, Email_Address, Password } = req.body;

        // Input validation
        if (!Admin_Name || !Email_Address || !Password) {
            return res.status(400).json({ 
                message: "All fields are required: Admin_Name, Email_Address, Password" 
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email_Address)) {
            return res.status(400).json({ 
                message: "Invalid email format" 
            });
        }

        // Check if admin with email already exists
        const checkQuery = "SELECT * FROM Admin WHERE Email_Address = ?";
        connection.query(checkQuery, [Email_Address], async (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Database error during email check:', checkErr);
                return res.status(500).json({ 
                    message: "Error checking email existence" 
                });
            }

            if (checkResult.length > 0) {
                return res.status(409).json({ 
                    message: "Admin with this email already exists" 
                });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Password, salt);

            // Insert new admin
            const insertQuery = "INSERT INTO Admin (Admin_Name, Email_Address, Password) VALUES (?, ?, ?)";
            connection.query(
                insertQuery, 
                [Admin_Name, Email_Address, hashedPassword],
                (insertErr, result) => {
                    if (insertErr) {
                        console.error('Database error during admin creation:', insertErr);
                        return res.status(500).json({ 
                            message: "Error creating admin account" 
                        });
                    }

                    return res.status(201).json({
                        message: "Admin registered successfully",
                        adminId: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            message: "Internal server error" 
        });
    }
};