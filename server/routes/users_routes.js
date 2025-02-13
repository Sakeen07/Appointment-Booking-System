import express from 'express';
import { register, login, logout } from '../controllers/users.js';

const UserRouter = express.Router();

UserRouter.post('/register', register);
UserRouter.post('/login', login);
UserRouter.post('/logout', logout);

export default UserRouter;