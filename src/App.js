import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContextStat from "./ContextAPI/ContetxStat";

import Login from "./screens/Login"
import TeamDashboard from "./screens/TeamDashboard";

import './App.css';
import DriveUploader from "./screens/Files";

import ChatRoom from "./screens/ChatRoom";


function App() {
  return (
    <>
      {/* Wrapping the entire app with a context provider */}
      <ContextStat>
        <Router>
          <div className="App">
            <Routes>
              <Route exact path="/" element={<Login />} />
              <Route exact path="/Team/:component" key={window.location.pathname} element={<TeamDashboard />} />
              <Route exact path="/DriveUploader" element={<DriveUploader />} />
              <Route exact path="/ChatRoom" element={<ChatRoom />} />

            </Routes>
          </div>
        </Router>
      </ContextStat>
    </>
  );
}


export default App;
