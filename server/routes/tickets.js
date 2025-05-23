const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const { auth, adminOrSupportAuth } = require('../middleware/auth');

router.post('/', auth, ticketsController.createTicket);
router.get('/', auth, ticketsController.getTickets);
router.patch('/:id', adminOrSupportAuth, ticketsController.updateTicket);

module.exports = router;
