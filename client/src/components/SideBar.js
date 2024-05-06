import React from 'react';
import '../stylesheets/SideBar.css';


const Sidebar = ({ currentView, setCurrentView, onQuestionsTabClick }) => {
return (
  <div className="sidebar">
    <ul className="menu">
      <li className={`menu-item ${currentView === "questions" ? "active-tab" : ""}`}
          onClick={onQuestionsTabClick}>
        Questions
      </li>
      <li className={`menu-item ${currentView === "tags" ? "active-tab" : ""}`}
          onClick={() => setCurrentView('tags')}> Tags
      </li>
    </ul>
  </div>
);
};


export default Sidebar;
