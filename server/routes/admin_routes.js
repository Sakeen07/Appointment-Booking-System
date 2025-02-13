import express from 'express';
import { adminLogin, registerAdmin, getAllAppointments, editAppointment, deleteAppointment } from '../controllers/admin.js';
import { verifyAdminToken } from '../middleware/admin.js';

const AdminRouter = express.Router();

AdminRouter.post('/login', adminLogin);
AdminRouter.post('/register', registerAdmin);


AdminRouter.use(verifyAdminToken);


AdminRouter.get('/appointments', getAllAppointments);
AdminRouter.put('/appointments/:id', editAppointment);
AdminRouter.delete('/appointments/:id', deleteAppointment);

export default AdminRouter;