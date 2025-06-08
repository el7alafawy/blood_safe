const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

const isHospital = (req, res, next) => {
  if (req.user && req.user.role === 'hospital') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Hospital privileges required.' });
  }
};

const isUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. User privileges required.' });
  }
};

const isAdminOrHospital = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'hospital')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or Hospital privileges required.' });
  }
};

const isAdminOrUser = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'user')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or User privileges required.' });
  }
};

module.exports = {
  isAdmin,
  isHospital,
  isUser,
  isAdminOrHospital,
  isAdminOrUser
}; 