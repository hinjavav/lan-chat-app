const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

router.use(adminAuth);

router.get('/users', adminController.getUsers);
router.get('/stats', adminController.getSystemStats);

router.post('/create-user', adminAuth, adminController.createUser);


module.exports = router;
