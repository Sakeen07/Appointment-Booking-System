import express from 'express';
import cors from 'cors';
import UserRouter from './routes/users_routes.js';
import AppointmentRouter from './routes/appointment_routes.js';
import AdminRouter from './routes/admin_routes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}))

app.use(express.json());
app.use(cookieParser());

app.use("/server/auth", UserRouter);
app.use("/server/appointment", AppointmentRouter);
app.use("/server/admin", AdminRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
