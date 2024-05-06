
const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/usersController');
const { loginUser } = require('../controllers/usersController'); // 


router.post('/register', registerUser);

router.post('/login', loginUser);

module.exports = router;
