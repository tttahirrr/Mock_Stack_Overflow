import React, { useState } from 'react';
import '../stylesheets/QuestionsOverview.css';
import { formatPostedTime } from '../utils/dateUtils';

const QuestionsOverview = ({ questions, getTagNamesByIds, onQuestionClick }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const questionsPerPage = 5;

    // handle next button click
    const handleNext = () => {
        setCurrentPage((prevPage) => (prevPage + 1) % Math.ceil(questions.length / questionsPerPage));
    };

    // handle previous button click
    const handlePrevious = () => {
        setCurrentPage((prevPage) => prevPage > 0 ? prevPage - 1 : 0);
    };

    // get current questions
    const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

    return (
        <div className="questions-overview">
            <div className="questions-container" style={{ overflowY: 'auto'}}>
                {currentQuestions.length > 0 ? (
                    currentQuestions.map((question) => (
                        <div key={question._id} className="question">
                            <div className="question-stats">
                                <div>{question.netVotes} Upvotes</div>
                                <div>{question.answers.length} Answers</div>
                                <div>{question.views} Views</div>
                            </div>
                            <div className="question-content">
                                <h3 className="question-title" onClick={() => onQuestionClick(question._id)}>{question.title}</h3>
                                <div className="question-text">{question.summary}</div>
                                <div className="question-tags">
                                    {question.tagNames?.map((tagName, index) => (
                                        <span key={index} className="question-tag">{tagName}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="question-meta">
                                <span className="user-name">{question.asked_by}</span>
                                <span> asked {formatPostedTime(question.ask_date_time)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ margin: '40px' }}>No Questions Found.</p>
                )}
            </div>
            <div className="pagination-buttons">
                <button onClick={handlePrevious} disabled={currentPage === 0}>Prev</button>
                <button onClick={handleNext} disabled={currentPage === Math.ceil(questions.length / questionsPerPage) - 1}>Next</button>
            </div>
        </div>
    );
};

export default QuestionsOverview;
