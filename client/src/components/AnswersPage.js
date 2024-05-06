

import React, { useState, useEffect } from 'react';
import { formatPostedTime } from '../utils/dateUtils';
import '../stylesheets/AnswersPage.css';
import NewAnswerForm from './NewAnswerForm';
import axios from 'axios'
import { renderTextWithHyperlinks } from '../utils/hyperlinkUtils';
import { jwtDecode } from 'jwt-decode'; 
import AddCommentToQuestionForm from './AddCommentToQuestionForm';
import AddCommentToAnswerForm from './AddCommentToAnswerForm';


const AnswersPage = ({ questionId, onAddAnswerClick, showAddQuestionForm, triggerDataRefresh, refreshData }) => {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showNewAnswerForm, setShowNewAnswerForm] = useState(false); // state to manage form visibility

  const [currentPage, setCurrentPage] = useState(0);
  const answersPerPage = 5;
  /////////////COMMENTS/////////////
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const toggleAddCommentForm = () => {
    setShowAddCommentForm(!showAddCommentForm);
  };
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(0);
  const commentsPerPage = 3; // display three comments at a time
  const totalCommentPages = Math.ceil(comments.length / commentsPerPage);

  const currentComments = comments.slice(commentPage * commentsPerPage, (commentPage + 1) * commentsPerPage);

  const handleCommentNext = () => {
    setCommentPage((prevPage) => (prevPage + 1) % totalCommentPages);
  };

  const handleCommentPrevious = () => {
    setCommentPage((prevPage) => (prevPage > 0 ? prevPage - 1 : 0));
  };

  /////////////COMMENTS/////////////

  

  useEffect(() => {
    const fetchQuestionAndTags = async () => {
        try {
            const questionResponse = await axios.get(`http://localhost:8000/api/questions/${questionId}`);
            const questionData = questionResponse.data
            
            // fetch tag names if IDs are present
            if (questionData && questionData.tags.length > 0) {
                const tagResponses = await Promise.all(
                    questionData.tags.map(tagId => 
                        axios.get(`http://localhost:8000/api/tags/${tagId}`)
                    )
                );
                const tagNames = tagResponses.map(response => response.data.name);
                // attach tag names to question object
                setQuestion({ ...questionData, tagNames });
            } else {
                setQuestion({ ...questionData, tagNames: [] });
            }
            /////////////COMMENTS/////////////
            const commentsResponse = await axios.get(`http://localhost:8000/api/comments/byQuestion/${questionId}`);
            setComments(commentsResponse.data.sort((a, b) => new Date(b.comment_date_time) - new Date(a.comment_date_time)));
            /////////////COMMENTS/////////////
            
            // fetch each answer using its ID
       const answerPromises = questionData.answers.map(ansId =>
        axios.get(`http://localhost:8000/api/answers/${ansId._id}`).then(res => res.data) //ansId._id instead of ansId b/c ansId is an actual answer
      );


      // wait for all answers to be fetched before setting the state
      Promise.all(answerPromises)
        .then(fetchedAnswers => {
          setAnswers(fetchedAnswers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time)));
          
        });

        triggerDataRefresh();

        } catch (error) {
            console.error('Error fetching question and/or tags:', error);
        }
    };

    if (questionId) {
        fetchQuestionAndTags();
    }
}, [questionId, refreshData]);


const handleNext = () => {
  setCurrentPage(prev => (prev + 1) % Math.ceil(answers.length / answersPerPage));
};

const handlePrevious = () => {
  setCurrentPage(prev => prev > 0 ? prev - 1 : 0);
};

const currentAnswers = answers.slice(currentPage * answersPerPage, (currentPage + 1) * answersPerPage);


   if (!question) {
    return <div>No question selected.</div>;
  }
   const toggleNewAnswerForm = () => setShowNewAnswerForm(!showNewAnswerForm);


  // handle adding an answer to be passed to NewAnswerForm
  const handleAddAnswer = (answerText, answerUsername) => {
   axios.post('http://localhost:8000/api/answers', {
     text: answerText,
     ans_by: answerUsername,
     question_id: questionId
   })
   .then(() => {
     // after successfully adding the new answer, refetch the question to get the updated list of answer IDs
     return axios.get(`http://localhost:8000/api/questions/${questionId}`);
   })
   .then(response => {
     // fetch details for each answer ID in the updated answers array
     const answerIds = response.data.answers;
     const answerPromises = answerIds.map(ansId => axios.get(`http://localhost:8000/api/answers/${ansId}`).then(res => res.data));
     return Promise.all(answerPromises);
   })
   .then(fetchedAnswers => {
     // now we have the full details of all answers. sort them by ans_date_time
     const sortedAnswers = fetchedAnswers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));
     setAnswers(sortedAnswers); // update the answers state
     setShowNewAnswerForm(false); // close the answer form
   })
   .catch(error => {
     console.error('Error fetching updated answers:', error);
   });
  };
  
  const handleUpvote = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to vote.');
        return;
    }

    try {
        const decoded = jwtDecode(token);
        const userId = decoded.user.id;

        const response = await axios.put(`http://localhost:8000/api/questions/${questionId}/upvote`, { userId });
        setQuestion(prev => ({
            ...prev,
            netVotes: response.data.netVotes  // use server's response to set netVotes
        }));
        //alert(response.data.message);  // display success message from server
    } catch (error) {
        if (error.response) {
            alert(`Error: ${error.response.data}`);  // display error message from server response
        } else {
            console.error('Error upvoting the question:', error);
            alert('Failed to upvote the question.');
        }
    }
  };

  const handleDownvote = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to vote.');
        return;
    }

    try {
        const decoded = jwtDecode(token);
        const userId = decoded.user.id;

        const response = await axios.put(`http://localhost:8000/api/questions/${questionId}/downvote`, { userId });
        setQuestion(prev => ({
            ...prev,
            netVotes: response.data.netVotes  // use server's response to set netVotes
        }));
        //alert(response.data.message);  // display success message from server
    } catch (error) {
        if (error.response) {
            alert(`Error: ${error.response.data}`);  // display error message from server response
        } else {
            console.error('Error downvoting the question:', error);
            alert('Failed to downvote the question.');
        }
    }
  };


  const handleAnswerUpvote = async (answerId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to vote.');
        return;
    }

    try {
        const decoded = jwtDecode(token);
        const userId = decoded.user.id;

        const response = await axios.put(`http://localhost:8000/api/answers/${answerId}/upvote`, { userId });
        //alert(response.data.message);
    } catch (error) {
        if (error.response) {
            alert(`Error: ${error.response.data}`);
        } else {
            console.error('Error upvoting the answer:', error);
            alert('Failed to upvote the answer.');
        }
    }
  };

  const handleAnswerDownvote = async (answerId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to vote.');
        return;
    }

    try {
        const decoded = jwtDecode(token);
        const userId = decoded.user.id;

        const response = await axios.put(`http://localhost:8000/api/answers/${answerId}/downvote`, { userId });
        //alert(response.data.message);
    } catch (error) {
        if (error.response) {
            alert(`Error: ${error.response.data}`);
        } else {
            console.error('Error downvoting the answer:', error);
            alert('Failed to downvote the answer.');
        }
    }
  };

  

  /////////COMMENT///////////
  const handleCommentUpvote = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to vote.');
        return;
    }

    try {
        const decoded = jwtDecode(token);
        const userId = decoded.user.id;

        const response = await axios.put(`http://localhost:8000/api/comments/${commentId}/upvote`, { userId });
        
    } catch (error) {
        if (error.response) {
            alert(`Error: ${error.response.data}`);
        } else {
            console.error('Error upvoting the answer:', error);
            alert('Failed to upvote the answer.');
        }
    }
  };
  /////////COMMENT///////////
  


   return (
      <div id="answer-page">
          <div id="question-details">
              <div id="answer-header">
                <div>
                  <span id="answers-count">{answers.length} Answers</span>
                  <span id="question-views">Views: {question.views}</span>
                  </div>
                  <h2 id="question-title">{question.title}</h2>
                  <button id="ask-question-button" onClick={showAddQuestionForm}>Ask Question</button>
              </div>
              <div id="question-info">
                  <div>
                    <span id="question-upvotes">Votes: {question.netVotes}</span>
                    <button className="upvote-button" onClick={() => handleUpvote()}>Upvote</button> 
                    <button className="downvote-button" onClick={() => handleDownvote()}>Downvote</button>
                  </div>
                  <p id="question-text" dangerouslySetInnerHTML={{
                  __html: renderTextWithHyperlinks(question.text)}}>
                  </p>
                  <div className="question-meta">
                      <span id="asked-by">{question.asked_by}</span>
                      <span id="ask-date"> asked {formatPostedTime(question.ask_date_time)}</span>
                  </div>
              </div>
              <div className="selected-question-tags">
                {question.tagNames?.map((tagName, index) => (
                                          <span key={index} className="selected-question-tag">{tagName}</span>
                                      ))}
              </div>
              <div className="question-comment-section">
                {/* //////////COMMENTS////////// */}
                <h3>Question Comments</h3>
                {currentComments.map((comment, index) => (
                    <div key={index} className="comment-container"> 
                        <div>
                          <button className="upvote-button" onClick={() => handleCommentUpvote(comment._id)}>Upvote</button>
                        </div>
                        <div className="comment-votes"><span>Votes: {comment.netVotes}</span></div>
                        <div className="comment-text">{comment.text}</div>
                        <div className="comment-meta">
                            <div className="commented-by">{comment.commented_by}</div>
                            <span className="commented-date">commented {formatPostedTime(comment.comment_date_time)}</span>
                        </div>
                    </div>
                ))}
                <div className="comment-pagination-buttons">
                  {comments.length > commentsPerPage && (
                  <>
                      <button onClick={handleCommentPrevious} disabled={commentPage === 0}>Prev</button>
                      <button onClick={handleCommentNext} disabled={commentPage >= totalCommentPages - 1}>Next</button>
                  </>
                  )}
                </div>
                <button className="add-comment-button" onClick={toggleAddCommentForm}>Add Comment</button>
                {showAddCommentForm && (<AddCommentToQuestionForm questionId={questionId} onClose={toggleAddCommentForm} /> )}
                {/* //////////COMMENTS////////// */}
              </div>
              
              

          </div>
          <div id="answers-list">
          
        {currentAnswers.map((answer, index) => (
          <div key={index} className="answer-comment-container">
            <div  className="answer-container">
              <div className="content-section">
                <div>
                  <span id="answer-upvotes">Votes: {answer.netVotes}</span>
                  <button className="upvote-button" onClick={() => handleAnswerUpvote(answer._id)}>Upvote</button>
                  <button className="downvote-button" onClick={() => handleAnswerDownvote(answer._id)}>Downvote</button>
                </div>
                <p className="answer-text" dangerouslySetInnerHTML={{ __html: renderTextWithHyperlinks(answer.text) }}></p>
              </div>
              <div className="meta-section">
                <span className="answered-by">{answer.ans_by}</span>
                <span className="answered-date">answered {formatPostedTime(answer.ans_date_time)}</span>
              </div>
            </div>
            {/* ANSWER COMMENTS */}
            
            {/* ANSWER COMMENTS */}
          </div>
          
          
        ))}
      </div>
      <div className="pagination-buttons">
        <button onClick={handlePrevious} disabled={currentPage === 0}>Prev</button>
        <button onClick={handleNext} disabled={currentPage === Math.ceil(answers.length / answersPerPage) - 1}>Next</button>
      </div>
      {!showNewAnswerForm && (
        <button id="answer-button" onClick={onAddAnswerClick}>Answer Question</button>
      )}
      {showNewAnswerForm && (
        <NewAnswerForm questionId={questionId} addAnswer={handleAddAnswer} onClose={toggleNewAnswerForm} />
      )}
    </div>
  );
};


export default AnswersPage;

