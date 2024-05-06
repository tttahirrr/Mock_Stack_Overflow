import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../stylesheets/AddCommentForm.css';

const AddCommentToQuestionForm = ({ questionId, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) {
            setError('Comment text is required.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Log in to post a comment.');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const commented_by = decoded.user.username;

            await axios.post(`http://localhost:8000/api/comments/question/${questionId}`, {
                text: commentText,
                commented_by, 
            });


            // clear form & close upon successful comment submission
            setCommentText('');
            onClose(); // close the form
            //alert('Comment added successfully!');
        } catch (error) {
            console.error('Error adding comment:', error);
            setError(error.response?.data?.message || 'Failed to post the comment.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-comment-form">
            <div className="comment-drop-down">
                <label htmlFor="commentText">Your Comment*</label>
                <textarea
                    id="commentText"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="form-footer">
                <button type="submit" className="submit-comment-btn">Post Comment</button>
                <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
        </form>
    );
};

export default AddCommentToQuestionForm;
