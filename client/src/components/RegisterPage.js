
import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheets/RegisterPage.css';

function RegisterPage({ handleRegisterSubmitClick }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/users/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });
            alert('Registration successful');
            console.log(response.data);
            // redirect or handle the login state change here
            handleRegisterSubmitClick();
        } catch (error) {
            console.error('Registration error:', error.response.data);
            alert('Failed to register: ' + error.response.data.msg);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
            />
            <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
            />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
            />
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
            />
            <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            <button type="submit">Sign Up</button>
        </form>
    );
}

export default RegisterPage;

