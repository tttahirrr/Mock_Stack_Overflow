import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';  
import '../stylesheets/Header.css';

const Header = ({ onSearch, isLoggedIn, handleLogout }) => {
    const [searchQuery, setSearchQuery] = useState("");

    // decode the JWT to get user information
    const getUserInfo = () => {
        const token = localStorage.getItem('token');
        if (!token) return "Guest";  // return "Guest" if no token is found
        try {
            const decoded = jwtDecode(token);  // use jwtDecode to decode the token
            return decoded.user.username; 
        } catch (error) {
            console.error('Error decoding token:', error);
            return "Guest";  // return "Guest" on error
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSearch(searchQuery);
        }
    };

    return (
        <div className="header">
            <div className="user-info">
                    <>
                        <div>Hey, {getUserInfo()}!</div>
                        <button className="log-out-button" onClick={handleLogout}>Log Out</button>
                    </>
            </div>
            <h1>Fake Stack Overflow</h1>
            <input
                type="search"
                id="search-bar"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default Header;
