import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheets/LoginPage.css';

function LoginPage({ setIsLoggedIn, handleLoginSubmitClick }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/users/login', {
                email,
                password
            });
            const { token } = response.data;
            localStorage.setItem('token', token);  // save the token in localStorage
            setIsLoggedIn(token);  // call the setIsLoggedIn function passed from App.js to handle login state
            handleLoginSubmitClick();
        } catch (error) {
            if (error.response) {
                setError(error.response.data.msg);
            } else {
                setError('Login failed. Please try again later.');
            }
        }
    };

    return (
        <div className="login-form">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Log In</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default LoginPage;

