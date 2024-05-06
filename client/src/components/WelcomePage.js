import React from 'react';
import '../stylesheets/WelcomePage.css';

function WelcomePage({ handleRegisterClick, handleLoginClick, handleGuestClick }) {
    return (
        <div className="welcome-page">
            <h1>Welcome to Fake Stack Overflow</h1>
            <div className="welcome-buttons">
              <button onClick={handleRegisterClick}>Register</button>
              <button onClick={handleLoginClick}>Login</button>
              <button onClick={handleGuestClick}>Continue as Guest</button>
            </div>
        </div>
    );
}

export default WelcomePage;

