import React, { useState, useEffect } from 'react';
import '../stylesheets/NewAnswerForm.css';
import { jwtDecode } from 'jwt-decode';

const NewAnswerForm = ({ questionId, addAnswer, onClose }) => {
  const [answerText, setAnswerText] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [hyperlinkError, setHyperlinkError] = useState('');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token);
        setUsername(decoded.user.username); // Automatically set the username from the token
    }
  }, []);

  const validateHyperlinks = (text) => {
      const hyperlinkPattern = /\[([^\]]+)\]\((http:\/\/|https:\/\/[^\s]+?)\)/g;
      const invalidHyperlinkPattern = /\[([^\]]+)\]\((?!http:\/\/|https:\/\/[^\s]+?).+?\)/g;

      if (invalidHyperlinkPattern.test(text) || (!hyperlinkPattern.test(text) && (/\[|\]/.test(text) || /\(|\)/.test(text)))) {
          setHyperlinkError('Invalid hyperlink format. Hyperlinks must be in the format [name](http://...) or [name](https://...).');
          return false;
      }
      setHyperlinkError(''); // clear hyperlink errors if format is now valid
      return true;
  };


  const handleSubmit = async (e) => {
   e.preventDefault();
   // resetting the errors and hyperlink errors before validation
   setError('');
   setHyperlinkError('');
    if (!answerText) {
     setError('Answer text is required.');
     return;
   }
   if(!username){
     setError('You must log in to post an answer.');
     return;
   }

    // validate hyperlinks in answer text
   if (!validateHyperlinks(answerText)) {
     return; // stop form submission if hyperlink validation fails
   }
    try {
     // await the completion of the addAnswer function to make sure it finishes before moving forward
     await addAnswer(questionId, answerText, username);
     // answer added successfully. reset form state
     setAnswerText('');
     //setUsername('');
     // close form on successful answer submission
     onClose();
   } catch (error) {
     // log the error to the console
     console.error('Error adding answer:', error);
     setError('Failed to post the answer.');
   }
  };
   return (
      <form onSubmit={handleSubmit} className="new-answer-form">
          <div>
              <label htmlFor="answerText">Answer Text*</label>
              <textarea id="answerText" value={answerText} onChange={e => setAnswerText(e.target.value)} />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          {hyperlinkError && <p className="error-message">{hyperlinkError}</p>}
          <div id="post-answer-footer">
              <button id="post-button" type="submit">Post Answer</button>
              <p className="mandatory-note">*indicates mandatory fields</p>
          </div>
      </form>
  );
};

export default NewAnswerForm;
