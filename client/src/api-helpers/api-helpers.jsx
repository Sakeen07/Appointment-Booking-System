import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000'
});

// user signup
export const signup = async (data) => {
    try {
        const res = await axiosInstance.post('/server/auth/register', {
            Username: data.username,
            Email_Address: data.email,
            Password: data.password
        });

        if (res.status === 201) {
            return res.data;
        }
        return null;
    } catch (err) {
        console.error('Signup error:', err.response?.data || err.message);
        throw err;
    }
};

// user login
export const login = async (data) => {
    try {
        const res = await axiosInstance.post('/server/auth/login', {
            Email_Address: data.email,
            Password: data.password
        });

        if (res.status === 200) {
            // Store user data and token
            const userData = res.data;
            localStorage.setItem('user', JSON.stringify(userData));
            // Set the token in axios default headers for subsequent requests
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            return userData;
        }
        return null;
    } catch (err) {
        console.error('Login error:', err.response?.data || err.message);
        throw err;
    }
};

// get all appointments of the user
export const getAppointment = async () => {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) {
            throw new Error('User not authenticated');
        }

        const { token } = JSON.parse(userData);
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const res = await axiosInstance.get('/server/appointment', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 200) {
            return res.data;
        }
        return null;
    } catch (err) {
        console.error('Error fetching appointments:', err.response?.data || err.message);
        throw err;
    }
};

// create a new appointment
export const createAppointment = async (data) => {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) {
            throw new Error('User not authenticated');
        }

        const { token, UserID } = JSON.parse(userData);
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const time = data.time.includes(':00') ? data.time : `${data.time}:00`;

        const requestData = {
            Description: data.description,
            PersonName: data.personName,
            Date: data.date,
            Time: time,
            UserID: UserID
        };

        const res = await axiosInstance.post('/server/appointment', requestData, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        return res.data;
    } catch (err) {
        if (err.response?.status === 409) {
            throw new Error('This time slot is already booked. Please select a different time.');
        }
        console.error('Error creating appointment:', {
            response: err.response?.data,
            status: err.response?.status,
            message: err.message
        });
        throw err;
    }
};

// update an appointment
export const updateAppointment = async (appointmentId, data) => {
    try {
        // Check if admin or regular user
        const adminData = localStorage.getItem('admin');
        const userData = localStorage.getItem('user');
        
        let endpoint = '';
        let headers = {};
        
        if (adminData) {
            const { token } = JSON.parse(adminData);
            endpoint = `/server/admin/appointments/${appointmentId}`;
            headers = { 'Authorization': `Bearer ${token}` };
        } else if (userData) {
            const { token } = JSON.parse(userData);
            endpoint = `/server/appointments/${appointmentId}`;
            headers = { 'Authorization': `Bearer ${token}` };
        } else {
            throw new Error('User not authenticated');
        }
        
        // Ensure time is in HH:mm:00 format
        const time = data.time.includes(':00') ? data.time : `${data.time}:00`;
        
        const res = await axiosInstance.put(endpoint, {
            date: data.date,
            time: time,
            description: data.description,
            personName: data.personName
        }, {
            headers: headers
        });

        if (res.status === 200) {
            return res.data;
        }
        return null;
    } catch (err) {
        if (err.response?.status === 409) {
            throw new Error('This time slot is already booked. Please select a different time.');
        }
        console.error('Error updating appointment:', err);
        throw err;
    }
};

// delete an appointment
export const deleteAppointment = async (id) => {
    try {
        const userData = localStorage.getItem('user');
        const adminData = localStorage.getItem('admin');

        if (!userData && !adminData) {
            throw new Error('Authentication required');
        }

        let endpoint = '';
        let token;

        if (adminData) {
            token = JSON.parse(adminData).token;
            endpoint = `/server/admin/appointments/${id}`;
        } else if (userData) {
            token = JSON.parse(userData).token;
            endpoint = `/server/appointments/${id}`;
        }

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const res = await axiosInstance.delete(endpoint);
        return res.data;
    } catch (err) {
        console.error('Error deleting appointment:', err);
        throw err;
    }
};

// user logout
export const logout = async () => {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) {
            return null;
        }

        const { token } = JSON.parse(userData);
        const res = await axiosInstance.post('/server/auth/logout', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 200) {
            localStorage.removeItem('user');
            delete axiosInstance.defaults.headers.common['Authorization'];
            return res.data;
        }
        return null;
    } catch (err) {
        console.error('Logout error:', err.response?.data || err.message);
        throw err;
    }
};

// Get Booked Times of the User
export const getBookedTimes = async (date) => {
    try {
        const userData = localStorage.getItem('user');
        const adminData = localStorage.getItem('admin');

        if (!userData && !adminData) {
            throw new Error('Authentication required');
        }

        let token;
        if (userData) {
            token = JSON.parse(userData).token;
        } else if (adminData) {
            token = JSON.parse(adminData).token;
        }

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await axiosInstance.get(`/server/appointment/booked-times/${date}`);
        return response.data;
    } catch (err) {
        console.error('Error fetching booked times:', err);
        throw err;
    }
};