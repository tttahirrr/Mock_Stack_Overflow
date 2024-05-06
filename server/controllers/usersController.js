

const bcrypt = require('bcryptjs');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        // check if user already exists
        const { email, firstName, lastName, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // extract username from email
        const username = email.split('@')[0];

        // check if username already exists
        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return res.status(400).json({ msg: 'Username already exists' });
        }

        // check if password includes firstName, lastName, or username
        if (password.includes(firstName) || password.includes(lastName) || password.includes(username)) {
            return res.status(400).json({ msg: 'Password must not contain your first name, last name, or username' });
        }

        // create a new user instance
        user = new User({
            firstName,
            lastName,
            email,
            password, // we will hash it below
            username
        });

        // hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // save user to the database
        await user.save();

        // return success
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};







exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Email does not exist' });
        }

        // Compare the submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Wrong password' });
        }

        // User matched, create JWT Payload
        const payload = {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                reputationPoints: user.reputationPoints
            }
        };

        const jwtSecret = 'super_secret_string';

        // Sign token
        jwt.sign(
            payload,
            jwtSecret, 
            { expiresIn: '1h' }, // Token expires in one hour
            (err, token) => {
                if (err) throw err;
                res.json({ token }); // Send token to client
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};







