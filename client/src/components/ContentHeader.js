import React from 'react';
import '../stylesheets/ContentHeader.css';


const ContentHeader = ({ onSortChange, questionCount, onAskQuestion }) => {
return (
  <div className="content-header">
    <div>
      <h2>All Questions</h2>
      <div className="question-count">Total questions: <span>{questionCount}</span></div>
    </div>
    <div>
      <button id="ask-question" onClick={onAskQuestion}>Ask Question</button>
      <div className="sorting-buttons">
        <button className="sort-btn" onClick={() => onSortChange('newest')}>Newest</button>
        <button className="sort-btn" onClick={() => onSortChange('active')}>Active</button>
        <button className="sort-btn" onClick={() => onSortChange('unanswered')}>Unanswered</button>
      </div>
    </div>
  </div>
);
};


export default ContentHeader;

