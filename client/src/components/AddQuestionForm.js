import React, { useState, useEffect } from 'react';
import '../stylesheets/AddQuestionForm.css';
import { jwtDecode } from 'jwt-decode';


const AddQuestionForm = ({ addQuestion, onClose }) => {
const [formData, setFormData] = useState({
  title: '',
  summary: '',
  text: '',
  tags: '',
  summary: '',
});
const [errors, setErrors] = useState({});
const [hyperlinkError, setHyperlinkError] = useState('');


useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token);
        setFormData(formData => ({ ...formData, askedBy: decoded.user.username }));
    }
}, []);


// hyperlink validation
const validateHyperlinks = (text) => {
  const hyperlinkPattern = /\[([^\]]+)\]\((http:\/\/|https:\/\/[^\s]+?)\)/g;
  const invalidHyperlinkPattern = /\[([^\]]+)\]\((?!http:\/\/|https:\/\/[^\s]+?).+?\)/g;

  return !(invalidHyperlinkPattern.test(text) || (!hyperlinkPattern.test(text) && (/\[|\]/.test(text) || /\(|\)/.test(text))));
};


const validateForm = () => {
  const newErrors = {};
  let isValid = true;


  if (!formData.title || formData.title.length > 50) {
      newErrors.title = 'Title must be between 1 and 50 characters.';
      isValid = false;
  }


  if (!formData.text || formData.text.length > 140) {
      newErrors.text = 'Text must be between 1 and 140 characters.';
      isValid = false;
  }


  const tagsArray = formData.tags.split(/\s+/).filter(Boolean);

  
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  if((tagsArray.length > 0) && (decoded.user.reputationPoints < 50)){
      newErrors.tags = 'User must have at least 50 reputation points to create a tag.';
      isValid = false;
  }

  if (tagsArray.length > 5 || tagsArray.some(tag => tag.length > 20)) {
      newErrors.tags = 'Between 0 to 5 tags are allowed. Each up to 20 characters.';
      isValid = false;
  }


  if (!formData.summary || formData.summary.length > 140) {
      newErrors.summary = 'Summary is required. At most 140 characters.';
      isValid = false;
  }


  if (!validateHyperlinks(formData.text)) {
      setHyperlinkError('Invalid hyperlink format. Hyperlinks must be in the format [name](http://...) or [name](https://...).');
      isValid = false;
  } else {
      setHyperlinkError(''); // clear the hyperlink error if the format is correct
  }


  setErrors(newErrors);
  return isValid;
};


const handleSubmit = async (e) => {
e.preventDefault();
if (validateForm()) {
   try {
       // wait for addQuestion to complete
       await addQuestion({
           ...formData,
           tagNames: formData.tags.split(/\s+/).filter(Boolean),
       });

       onClose(); // close form after submission
   } catch (error) {
       console.error('Failed to add question:', error);
   }
}
};


const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};


return (
  <form className="ask-question-form" onSubmit={handleSubmit}>
      <div>
          <label htmlFor="title">Title*</label>
          <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
          />
          {errors.title && <p style={{ color: 'red' }}>{errors.title}</p>}
      </div>
      <div>
          <label htmlFor="text">Text*</label>
          <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
          />
          {errors.text && <p style={{ color: 'red' }}>{errors.text}</p>}
      </div>
      <div>
          <label htmlFor="tags">Tags*</label>
          <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
          />
          {errors.tags && <p style={{ color: 'red' }}>{errors.tags}</p>}
      </div>
      <div>
          <label htmlFor="summary">Summary*</label>
          <input
              id="summary"
              name="summary"
              type="text"
              value={formData.summary}
              onChange={handleChange}
          />
          {errors.summary && <p style={{ color: 'red' }}>{errors.summary}</p>}
      </div>
      {hyperlinkError && <p style={{ color: 'red' }}>{hyperlinkError}</p>}
      <div className="form-footer">
          <div className="buttons-container">
              <button type="submit">Submit</button>
              <button type="button" onClick={onClose}>Cancel</button>
          </div>
          <span className="mandatory-note">* indicates mandatory fields</span>
      </div>
  </form>
);
};
export default AddQuestionForm;
