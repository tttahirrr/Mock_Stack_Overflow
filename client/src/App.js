import React, { useState, useEffect } from 'react';
import './stylesheets/App.css';
import Header from './components/Header';
import Sidebar from './components/SideBar';
import ContentHeader from './components/ContentHeader';
import QuestionsOverview from './components/QuestionsOverview';
import AddQuestionForm from './components/AddQuestionForm';
import AnswersPage from './components/AnswersPage';
import NewAnswerForm from './components/NewAnswerForm';
import TagsPage from './components/TagsPage';

import WelcomePage from './components/WelcomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import { jwtDecode } from 'jwt-decode';

import axios from 'axios';


// sorting functions
const sortQuestionsNewest = (questions) => questions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));


const sortQuestionsActive = (questions) => {
 return questions.sort((a, b) => {
   // handle null latestAnswerDate by setting to lowest possible date
   const lastActivityA = a.latestAnswerDate ? new Date(a.latestAnswerDate) : new Date(0);
   const lastActivityB = b.latestAnswerDate ? new Date(b.latestAnswerDate) : new Date(0);


   return lastActivityB - lastActivityA;
 });
};


const filterUnansweredQuestions = (questions) => {
return sortQuestionsNewest(questions.filter(q => q.answers.length === 0));
};


function App() {
const [questions, setQuestions] = useState([]);
const [showForm, setShowForm] = useState(false); // state to toggle form visibility
const [originalQuestions, setOriginalQuestions] = useState([]); // holds the unmodified questions list. for SORTING
const [currentView, setCurrentView] = useState("questions");
const [selectedQuestionId, setSelectedQuestionId] = useState(null);
const [isAddingAnswer, setIsAddingAnswer] = useState(false); // state to manage adding answer view
const [tags, setTags] = useState([]);
const [refreshData, setRefreshData] = useState(false); // use to fix refresh on AnswersPage

const [isLoggedIn, setIsLoggedIn] = useState(false);  // manage login state
const [isGuest, setIsGuest] = useState(false);  // manage guest state

// if token exists & not expired, the user must have logged in recently
useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // current time in seconds
        if (decodedToken.exp < currentTime) {
            localStorage.removeItem('token'); // remove expired token
            setIsLoggedIn(false);
        } else {
            setIsLoggedIn(true);
        }
    }
}, []);


// logging out removes the token
const handleLogout = () => {
  localStorage.removeItem('token');
  setIsLoggedIn(false);
  setCurrentView('questions');  // redirect to Welcome Page
  setIsGuest(false);
};


const toggleFormVisibility = () => {
  setShowForm(!showForm);
};


// toggle the refresh trigger
const triggerDataRefresh = () => {
  setRefreshData(!refreshData);
};


const fetchQuestions = async () => {
 try {
   const response = await axios.get('http://localhost:8000/api/questions');
   const fetchedQuestions = response.data;


   // fetch & attach tag names for each question
   const questionsWithTags = await Promise.all(fetchedQuestions.map(async (question) => {
     // only proceed if there are tags to resolve
     if (question.tags.length) {
       const tagNames = await getTagNamesByIds(question.tags);
       return { ...question, tagNames }; // append resolved tag names
     }
     return question; // if no tags, return question as is
   }));


   // sort & update state
   const sortedByNewest = sortQuestionsNewest(questionsWithTags); // response.data should be the list of all questions
   setOriginalQuestions(sortedByNewest);                          // update both originalQuestions
   setQuestions(sortedByNewest);                                  // & questions state with the sorted list
 } catch (error) {
   console.error('Error fetching questions:', error);
 }
};




// use useEffect to fetch questions on component mount
useEffect(() => {
 fetchQuestions();
}, []); // empty dependency array means this runs once on component mount


 const handleSortChange = (sortType) => {
  let sortedQuestions = [];


  switch (sortType) {
    case 'newest':
      sortedQuestions = sortQuestionsNewest([...originalQuestions]);
      break;
    case 'active':
      sortedQuestions = sortQuestionsActive([...originalQuestions]);
      break;
    case 'unanswered':
      sortedQuestions = filterUnansweredQuestions([...originalQuestions]);
      break;
    default:
      sortedQuestions = [...originalQuestions];
  }
  setQuestions(sortedQuestions);
};


const handleAskQuestion = () => {
  if (isLoggedIn) {
    toggleFormVisibility(); // toggles the visibility of AddQuestionForm
  }else{
    alert("Please log in to ask a question.");
  }
};



// takes in array of tag names. add any new tags to the database. returns array of IDs of each tag from input array
const processTags = async (tagNames) => {
 const tagIds = await Promise.all(tagNames.map(async (tagName) => {
   try {
     const response = await axios.post('http://localhost:8000/api/tags', { name: tagName });
     return response.data._id;
   } catch (error) {
     console.error('Error processing tag:', error);
     return null;
   }
 }));


 return tagIds.filter(id => id !== null);
};
const addQuestion = async (newQuestion) => {
 try {
   // process tags to get their IDs
   const tagIds = await processTags(newQuestion.tagNames);


   // construct the new question object
   const questionToSubmit = {
     title: newQuestion.title,
     text: newQuestion.text,
     asked_by: newQuestion.askedBy,
     tags: tagIds,
     summary: newQuestion.summary,
     // don't need to include fields like ask_date_time, views, answers, & latestAnswerDate here
     // they are set to default values by schema when the document is created
   };


   // use axios to submit the new question to API
   const response = await axios.post('http://localhost:8000/api/questions/addQuestion', questionToSubmit);


   // log what we added
   console.log('Question added:', response.data);


   // fetch & update the list of questions to reflect the new addition
   fetchQuestions();


   updateTagsState();


   setShowForm(false); // hide the form


 } catch (error) {
   console.error('Error adding question:', error);
 }
};


const getTagNamesByIds = async (tagIds) => {
 const tagNames = [];


 for (const id of tagIds) {
   try {
     const response = await axios.get(`http://localhost:8000/api/tags/${id}`);
     tagNames.push(response.data.name);
   } catch (error) {
     console.error('Error fetching tag:', error);
     tagNames.push('Unknown Tag');
   }
 }


 return tagNames;
};


const parseSearchQuery = (searchQuery) => {
  const tagPattern = /\[([^\]]+)\]/g;
  let tags = [];
  let keywords = [];
  let match;
   // extract tags
  while ((match = tagPattern.exec(searchQuery)) !== null) {
    tags.push(match[1].toLowerCase());
  }
   // remove tags from searchQuery and split remaining into keywords
  keywords = searchQuery.replace(tagPattern, '')
                         .split(/\s+/)
                         .filter(Boolean) // remove empty strings
                         .map(word => word.toLowerCase());
   return { tags, keywords };
};


const handleSearch = (searchQuery) => {
 if (!searchQuery.trim()) {
   return; // exit the function if search is empty
 }


 const { tags, keywords } = parseSearchQuery(searchQuery);


 // construct a query string from tags & keywords
 const queryParams = new URLSearchParams({
   tags: tags.join(','),        // convert array to comma separated string
   keywords: keywords.join(',') // convert array to comma separated string
 }).toString();


 axios.get(`http://localhost:8000/api/questions/search?${queryParams}`)
   .then(response => {
     const sortedResult = sortQuestionsNewest(response.data); // sort matching questions by newest
     setQuestions(sortedResult); // update the questions state with the sorted search result
     setShowForm(false);
     setCurrentView("questions");
   })
   .catch(error => console.error('Error searching questions:', error));
};
const handleQuestionClick = (qid) => {
 // use axios to send a 'put' request to increment question views
 axios.put(`http://localhost:8000/api/questions/${qid}/incrementViews`)
   .then(() => {
     console.log('Question views incremented');
     triggerDataRefresh();
   })
   .catch(error => console.error('Error incrementing question views:', error));


 // continue with setting state
 setSelectedQuestionId(qid); // set the selected question ID
 setCurrentView("answers"); // change view to show answers
 setIsAddingAnswer(false);
};


const handleAddAnswerClick = () => {
  setIsAddingAnswer(true); // move to adding answer state
  setCurrentView("addAnswer");
};


const handleAnswerSubmitted = () => {
  setIsAddingAnswer(false); // return to answers view after submitting an answer
  setCurrentView("answers");
};


const addAnswer = (questionId, answerText, username) => {
 axios.post('http://localhost:8000/api/answers', {
   questionId,
   text: answerText,
   ans_by: username
 })
 .then(response => {
   console.log('Answer added:', response.data);
 })
 .catch(error => console.error('Error adding answer:', error));
};





const showAddQuestionForm = () => {
  if (isLoggedIn) {
    setShowForm(true);
    setCurrentView("questions");
    setIsAddingAnswer(false);
  } else {
    alert("Please log in to ask a question."); 
  }
};

const handleTagClick = (tagName) => {
 axios.get(`http://localhost:8000/api/questions/byTag/${encodeURIComponent(tagName)}`)
   .then(response => {
     const questionsWithTags = response.data.map(question => ({
       ...question,
       tagNames: question.tags?.map(tag => tag.name) || [] // make sure every question has a tagNames array. even if it's empty
     }));
     setQuestions(questionsWithTags); // use questionsWithTags to make sure structure is consistent
     setCurrentView('questions');
   })
   .catch(error => console.error('Error fetching questions by tag:', error));
};




// when rendering TagsPage component
{currentView === 'tags' && (
  <TagsPage tags={tags} onTagClick={handleTagClick} />
)}


useEffect(() => {
 updateTagsState();
}, []); // dependency array is empty. indicating this effect runs once on mount


const handleQuestionsTabClick = () => {
  fetchQuestions(); // reset question list to default sorted state
  setCurrentView("questions"); // update current view to "questions"
};


const updateTagsState = () => {
 axios.get('http://localhost:8000/api/tags')
   .then(response => {
     const updatedTags = response.data; // this now includes tags with their question counts. each element in updated tags is like {"_id": "tagId123", "name": "TagName", "questionCount": 5}
     setTags(updatedTags);
   })
   .catch(error => console.error('Error fetching tags:', error));
};

////////////////////////////////////
const handleRegisterClick = () => {
  setCurrentView("register");  
};

const handleLoginClick = () => {
  setCurrentView("login");  
};

const handleGuestClick = () => {
  setIsGuest(true);
  setCurrentView("questions");
};








////////////////////////////////////
  if(isLoggedIn || isGuest) {
    return (
      <div className="app">
        <Header onSearch={handleSearch} isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <div className="main-content">
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} onQuestionsTabClick={handleQuestionsTabClick} />
          <div className="content">
            {showForm ? (
              <AddQuestionForm addQuestion={addQuestion} onClose={toggleFormVisibility} />
            ) : currentView === "questions" ? (
              <>
                <ContentHeader onSortChange={handleSortChange} questionCount={questions.length} onAskQuestion={handleAskQuestion} />
                <QuestionsOverview questions={questions} getTagNamesByIds={getTagNamesByIds} onQuestionClick={handleQuestionClick} />
              </>
            ) : currentView === "tags" ? (
              <TagsPage tags={tags} onTagClick={handleTagClick} showAddQuestionForm={showAddQuestionForm}/>
            ) : currentView === "answers" && !isAddingAnswer ? (
              <AnswersPage questionId={selectedQuestionId} onAddAnswerClick={handleAddAnswerClick} showAddQuestionForm={showAddQuestionForm} triggerDataRefresh={triggerDataRefresh} refreshData={refreshData}/>
            ) : currentView === "addAnswer" && isAddingAnswer ? (
              <NewAnswerForm questionId={selectedQuestionId} addAnswer={addAnswer} onClose={handleAnswerSubmitted} />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // if not logged in or a guest, show welcome page or authentication pages
  if (currentView === "login") {
    return <LoginPage setIsLoggedIn={setIsLoggedIn} handleLoginSubmitClick={handleQuestionsTabClick}/>; // after user submits login, they are taken to the home page displaying the questions
  }

  if (currentView === "register") {
    return <RegisterPage handleRegisterSubmitClick={handleLoginClick}/>; // after user submits register, they are taken to login page
  }

  // default to WelcomePage if none of the above conditions are met
  return (
    <WelcomePage
        handleRegisterClick={handleRegisterClick}
        handleLoginClick={handleLoginClick}
        handleGuestClick={handleGuestClick}
    />
  );

}

export default App;
