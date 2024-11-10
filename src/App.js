import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContextStat from "./ContextAPI/ContetxStat";

import Login from "./screens/Login"
import Dashboard from "./screens/TeamDashboard";
import AdminH2HDashboard from "./admin/AdminH2HDashboard";
import ProjectPage from "./admin/ProjectPage";
import TeamDashboard from "./admin/TeamDashboard";
import './App.css';
import ChatRoom from "./screens/ChatRoom";

import Github from './screens/Github'


function App() {
  return (
    <>
      {/* Wrapping the entire app with a context provider */}
      <ContextStat>
        <Router>
          <div className="App">
            <Routes>
              <Route exact path="/" element={<Login />} />
              <Route exact path="/Team/:component" key={window.location.pathname} element={<Dashboard />} />
              <Route exact path="/ChatRoom" element={<ChatRoom />} />
              <Route exact path="/git" element={<Github />} />

              <Route exact path="/AdminH2HDashboard" element={<AdminH2HDashboard />} />
              <Route exact path="/projects/:projectId" element={<ProjectPage />} />
              <Route exact path="/teams/:teamId" element={<TeamDashboard />} />
            </Routes>
          </div>
        </Router>
      </ContextStat>
    </>
  );
}


export default App;
