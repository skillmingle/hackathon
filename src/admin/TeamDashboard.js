import React, { useState, useEffect,useContext } from 'react';
import { useParams } from 'react-router-dom';
import ContextApi from '../ContextAPI/ContextApi';

import "./css/TeamDashboard.css";
import "./css/CreateTask.css"

const TeamDashboard = () => {

  const { user } = useContext(ContextApi); // Get the logged-in user

  const { teamId } = useParams(); // Get the teamId from the URL
  const [team, setTeam] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState(""); // For adding new members
  const [loading, setLoading] = useState(true);

  
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}/tasks`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [teamId]);

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };



  // Fetch team details
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}`);
        const data = await response.json();

        if (data.success) {
          setTeam(data.team);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team:', error);
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  // Add a new member to the team
  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}/addMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newMemberEmail }), // Assuming we add by email and find user in backend
      });

      const data = await response.json();

      if (data.success) {
        setTeam(data.team); // Update the team with the new member
        setNewMemberEmail(""); // Clear the input field
      } else {
        console.error('Error adding team member:', data.message);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="team-dashboard-container">
      <div>
        <h1>{team?.teamName} - Dashboard</h1>
        <h3>Team Leader: {team?.leaderUserId.name}</h3>

        <h4>Members:</h4>
        <ul>
          {team?.members.map((member) => (
            <li key={member._id}>{member.name}</li>
          ))}
        </ul>
      </div>

      <div>
        {/* Add New Member */}
        <form onSubmit={handleAddMember} className="add-member-form">
          <label htmlFor="newMemberEmail">Add Team Member (User Email):</label>
          <input
            type="text"
            id="newMemberEmail"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Enter user email"
            required
          />
          <button type="submit" className="add-member-btn">Add Member</button>
        </form>
      </div>
      <hr/>
    </div>
  );
};

export default TeamDashboard;

