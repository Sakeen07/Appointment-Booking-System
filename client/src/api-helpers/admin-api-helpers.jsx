import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000'
});

//Admin login
export const adminLogin = async (data) => {
    try {
        const res = await axiosInstance.post('/server/admin/login', {
            Email_Address: data.email,
            Password: data.password
        });

        if (res.status === 200) {
            // Store admin data and token
            const adminData = res.data;
            localStorage.setItem('admin', JSON.stringify(adminData));
            // Set the token in axios default headers for subsequent requests
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${adminData.token}`;
            return adminData;
        }
        return null;
    } catch (err) {
        console.error('Admin login error:', err.response?.data || err.message);
        throw err;
    }
};

// get all appointments (admin view)
export const getAllAppointments = async () => {
    try {
        const adminData = localStorage.getItem('admin');
        if (!adminData) {
            throw new Error('Admin not authenticated');
        }

        const { token } = JSON.parse(adminData);
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const res = await axiosInstance.get('/server/admin/appointments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 200) {
            return res.data;
        }
        return null;
    } catch (err) {
        console.error('Error fetching all appointments:', err.response?.data || err.message);
        throw err;
    }
};

// admin logout
export const adminLogout = async () => {
    try {
        localStorage.removeItem('admin');
        delete axiosInstance.defaults.headers.common['Authorization'];
        return { message: "Admin logged out" };
    } catch (err) {
        console.error('Admin logout error:', err.response?.data || err.message);
        throw err;
    }
};