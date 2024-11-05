import React, { useState, useContext, useEffect } from "react";
import CreateProjectForm from "../Components/CreateProjectModal"; // Renamed from CreateProjectModal to reflect that it's no longer a modal
import "./css/Dashboard&projectmodal.css";
import ContextApi from "../ContextAPI/ContextApi";
import { useNavigate } from "react-router-dom";
// import Sidebar from './Sidebar'; // Import Sidebar component

const AdminH2HDashboard = () => {
  const [showForm, setShowForm] = useState(false);

  const { user } = useContext(ContextApi); // Get the logged-in user
  const userId = user.id;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setisAuthenticated] = useState(false);
  const navigate = useNavigate();

  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    if (user.email == "sachin@gmail.com" || user.email == "sahil@gmail.com") {
      setisAuthenticated(true);
    }else{
      navigate('/')
    }
  }, [user]);

  // Fetch projects for the logged-in user
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `https://h2h-backend-7ots.onrender.com/api/user-projects`
        );
        const data = await response.json();

        if (data.success) {
          setLoading(false);

          setProjects(data.projects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  // Function to handle view project
  const handleViewProject = (projectId) => {
    console.log(projectId);

    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleCreateProjectClick = () => {
    setShowForm(!showForm); // Toggle the form visibility
  };

  return (
    <>
    {isAuthenticated && <div className="dashboard-container">
      <div>
        <h1>Dashboard</h1>
        <button
          className="create-project-btn"
          onClick={handleCreateProjectClick}
          >
          {showForm ? "Cancel" : "Create Project"}
        </button>

        {/* Render the CreateProjectForm conditionally below the button */}
        {showForm && <CreateProjectForm />}
      </div>
      <div>
        <h1>Your Projects</h1>
        <div className="projects-grid">
          {projects?.map((project) => (
            <div key={project._id} className="project-card">
              <h2>{project.projectName}</h2>
              <p>{project.description}</p>
              <button
                className="view-btn"
                onClick={() => handleViewProject(project._id)}
                >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>}
          </>
  );
};

export default AdminH2HDashboard;
