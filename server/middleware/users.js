import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Set the userId in the request object
        req.userId = decodedToken.id;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};