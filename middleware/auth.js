const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id || !mongoose.isObjectIdOrHexString(decoded.id)) {
            return res.status(401).json({ message: 'Not authorized token failed' });
        }

        // We attach the user to the request object, minus the password
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized token failed' });
    }
};