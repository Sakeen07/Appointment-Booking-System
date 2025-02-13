import express from 'express';
import { getAppointment, createAppointment, updateAppointment, deleteAppointment, getBookedTimes } from '../controllers/appointment.js';
import { verifyToken } from '../middleware/users.js';

const AppointmentRouter = express.Router();

AppointmentRouter.use(verifyToken);

AppointmentRouter.get('/booked-times/:date', getBookedTimes);
AppointmentRouter.get('/', getAppointment);
AppointmentRouter.post('/', createAppointment);
AppointmentRouter.put('/:id', updateAppointment);
AppointmentRouter.delete('/:id', deleteAppointment);

export default AppointmentRouter;