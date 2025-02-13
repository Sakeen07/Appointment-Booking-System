import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Check if the token belongs to an admin
        if (!decodedToken.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Admin privileges required' });
        }
        
        // Set the adminId in the request object
        req.adminId = decodedToken.id;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};