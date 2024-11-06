import React, { useState, useEffect,useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "./css/ProjectPage.css";
import CreateNotice from './CreateNotice';
import ContextApi from "../ContextAPI/ContextApi";

const ProjectPage = () => {

  const { user } = useContext(ContextApi); // Get the logged-in user

  const { projectId } = useParams(); // Get the projectId from the URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false); // Toggle form visibility
  const [teamName, setTeamName] = useState("");
  const [leaderUserId, setLeaderUserId] = useState(""); // This should come from context or props
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate(); // For navigation
  const [driveFolderId, setDriveFolderId] = useState("")
  const [showCreateNoticeForm, setShowCreateNoticeForm] = useState(false)
const [clicked, setclicked] = useState(false)
  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/projects/${projectId}`);
        const data = await response.json();

        if (data.success) {
          setProject(data.project);
        }

        // Fetch Teams for the Project
        const teamResponse = await fetch(`https://h2h-backend-7ots.onrender.com/api/projects/${projectId}/teams`);
        const teamData = await teamResponse.json();
        if (teamData.success) {
          setTeams(teamData.teams);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleViewTeam = (teamId) => {
    navigate(`/teams/${teamId}`); // Navigate to the Team Dashboard
  };

  // Handle form submission for creating a team
  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/projects/${projectId}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          leaderUserId,
          driveFolderId // You can get this from the logged-in user context
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Team created successfully");
        // Optionally, reset the form or fetch the updated project details
        setTeamName("");
        setShowCreateTeamForm(false);
      } else {
        alert("Error creating team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  
  const handleNotice=()=>{
    setShowCreateNoticeForm(true)
  }

  
  const handlekaro= (team)=>{
    const u= { id: user.id, name: user.name, email: user.email, teamId: team}
    localStorage.setItem('userData', JSON.stringify(u));
    navigate('/Team/Dashboard');

  }

  
  return (
    <div className="project-page-container">
        <div>

      <h1>{project.projectName}</h1>
      <p>{project.description}</p>
      {/* {showCreateNoticeForm && <CreateNotice projectId={projectId} teams={teams}/>}
      <button className="create-team-btn" onClick={handleNotice}>Send Notice</button> */}

      {/* Create Team Button */}
      <button
        className="create-team-btn"
        onClick={() => setShowCreateTeamForm(!showCreateTeamForm)}
        >
        {showCreateTeamForm ? "Hide Create Team Form" : "Create Team"}
      </button>

      {/* Render Create Team Form */}
      {showCreateTeamForm && (
          <form className="create-team-form" onSubmit={handleCreateTeam}>
          <div className="form-group">
            <label htmlFor="teamName">Team Name:</label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              />
          </div>

          <div className="form-group">
            <label htmlFor="leaderUserId">Leader User ID:</label>
            <input
              type="text"
              id="leaderUserId"
              value={leaderUserId}
              onChange={(e) => setLeaderUserId(e.target.value)}
              required
              />
          </div>

          <div className="form-group">
            <label htmlFor="leaderUserId">Google Drive Folder ID:</label>
            <input
              type="text"
              id="driveFolderId"
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              required
              />
          </div>

          <button type="submit" className="submit-team-btn">
            Create Team
          </button>
        </form>
      )}
      </div>
      <div>
      <h2>Teams</h2>
      <div className="team-cards-container">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div key={team._id} className="team-card">
              <h3>{team.teamName}</h3>
              <p>Team Leader: {team.leaderUserId}</p>

              {team?.messageSeen?<></>:<p style={{fontWeight:700, fontSize:'20px', color:'red'}}>Action Required</p>}
              <button
                className="view-team-btn"
                onClick={() => handleViewTeam(team._id)}
              >
                Manage
              </button>

              <button
                className="view-team-btn"
                onClick={() => handlekaro(team._id)}
              >
                View Dashboard
              </button>

            </div>
          ))
        ) : (
          <p>No teams created yet for this project.</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default ProjectPage;
