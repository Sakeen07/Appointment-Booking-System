import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import connection from '../database.js';

dayjs.extend(customParseFormat);

// Get Appointment
export const getAppointment = async (req, res) => {
    const userId = req.userId;
    
    const q = `
        SELECT 
            a.*,
            DATE_FORMAT(a.Date, '%Y-%m-%d') as Date,
            TIME_FORMAT(a.Time, '%H:%i:%s') as Time,
            r.Username 
        FROM Appointments a 
        JOIN Register r ON a.UserID = r.UserID 
        WHERE a.UserID = ?
        ORDER BY a.Date DESC, a.Time DESC
    `;

    connection.query(q, [userId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: err.message });
        }
        console.log('Appointments fetched from database:', result);
        return res.status(200).json(result);
    });
};

// Create Appointment
export const createAppointment = async (req, res) => {
    console.log('Creating appointment with user ID:', req.userId);
    console.log('Request body:', req.body);

    const { Description, PersonName, Date, Time } = req.body;

    if (!Description || !PersonName || !Date || !Time) {
        return res.status(400).json({ message: 'Description, Person Name, Date, and Time are required' });
    }

    if (!req.userId) {
        return res.status(401).json({ message: 'User ID not found in token' });
    }

    // First check if there's any existing appointment at the same date and time
    const checkQuery = "SELECT COUNT(*) as count FROM Appointments WHERE Date = ? AND Time = ?";
    
    connection.query(checkQuery, [Date, Time], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Database error during check:', checkErr);
            return res.status(500).json({ message: checkErr.message });
        }

        if (checkResult[0].count > 0) {
            return res.status(409).json({ 
                message: 'This time slot is already booked. Please select a different time.' 
            });
        }

        // If no existing appointment, proceed with creation
        const insertQuery = "INSERT INTO Appointments (UserID, Description, PersonName, Date, Time) VALUES (?, ?, ?, ?, ?)";
        const values = [req.userId, Description, PersonName, Date, Time];

        connection.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: err.message });
            }

            return res.status(201).json({ 
                message: "Appointment created", 
                appointmentId: result.insertId,
                userId: req.userId
            });
        });
    });
};

// Update Appointment
export const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { description, personName, date, time } = req.body;

    if (!description || !personName || !date || !time) {
        return res.status(400).json({ message: 'Description, Person Name, Date, and Time are required' });
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
        const updateQuery = "UPDATE Appointments SET `Description` = ?, `PersonName` = ?, `Date` = ?, `Time` = ? WHERE `UserID` = ? AND `AppointmentID` = ?";
        const values = [description, personName, date, time, req.userId, id];

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

    const q = "DELETE FROM Appointments WHERE `UserID` = ? AND `AppointmentID` = ?";

    connection.query(q, [req.userId, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        return res.status(200).json({ message: "Appointment deleted" });
    });
};

// Get Booked Times
export const getBookedTimes = async (req, res) => {
    try {
        const { date } = req.params;
        
        if (!date) {
            return res.status(400).json({ 
                message: 'Date parameter is required',
                bookedTimes: []
            });
        }

        const query = "SELECT Time, AppointmentID FROM Appointments WHERE Date = ?";
        
        connection.query(query, [date], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    message: err.message,
                    bookedTimes: []
                });
            }
            
            // Format times consistently and include appointment IDs
            const bookedTimes = result.map(row => ({
                time: dayjs(row.Time, 'HH:mm:ss').format('HH:mm:ss'),
                appointmentId: row.AppointmentID
            }));

            return res.status(200).json({ bookedTimes });
        });
    } catch (error) {
        console.error('Error in getBookedTimes:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            bookedTimes: []
        });
    }
};