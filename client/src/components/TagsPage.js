import React from 'react';
import '../stylesheets/TagsPage.css';


const TagsPage = ({ tags, onTagClick, showAddQuestionForm }) => {
  // function to render tags in groups of three
  const renderTagsInGroups = () => {
      const rows = [];
      for (let i = 0; i < tags.length; i += 3) {
          rows.push(tags.slice(i, i + 3));
      }
      return rows.map((row, index) => (
          <div key={index} className="tag-row">
              {row.map(tag => (
                  <div key={tag._id} className="tag-block" onClick={() => onTagClick(tag.name)}>
                      <a href="#" className="tag-name">{tag.name}</a>
                      <span className="tag-count">{tag.questionCount}
                          {' '}Question{tag.questionCount !== 1 ? 's' : ''}
                      </span>
                  </div>
              ))}
          </div>
      ));
  };
   return (
      <div className="tag-page">
          <div className="tag-header">
              <div>{tags.length} Tags</div>
              <h1>All Tags</h1>
              <button className="ask-question-btn" onClick={showAddQuestionForm}>Ask Question</button>
          </div>
          <div className="tag-list">
              {renderTagsInGroups()}
          </div>
      </div>
  );
};


export default TagsPage;