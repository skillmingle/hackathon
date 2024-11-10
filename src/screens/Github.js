import React, { useState, useEffect,useContext } from "react";
import axios from "axios";
import { GithubActivityFeed } from "react-github-activity-feed";
import '../css/githubrepo.css'
import { toast, Toaster } from "react-hot-toast";
import GridLoader from "react-spinners/GridLoader";
import ContextApi from '../ContextAPI/ContextApi';


const Github = ({ teamId }) => {
  const [githubData, setGithubData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("");
  const [repo, setRepo] = useState("");
  const [spinner, setspinner] = useState(false)

  const { user } = useContext(ContextApi);
  const { name,id } = user;

  // Fetch GitHub data for the team
  const fetchGithubData = async () => {
    try {
      const response = await axios.get(`https://h2h-backend-7ots.onrender.com/api/team/${teamId}/github`);
      if (response.data.success) {
        setGithubData(response.data.githubRepo);
        setUserName(response.data.githubRepo.userName || "");
        setRepo(response.data.githubRepo.repo || "");
      }
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
    } finally {
      setspinner(false);
    }
  };

  // Update GitHub data
  const handleSave = async () => {
    setspinner(true)
    try {
      const response = await axios.put(`https://h2h-backend-7ots.onrender.com/api/team/${teamId}/github`, {
        userName,
        repo,
        name,
        id
      });
      setspinner(false)
      if (response.data.success) {
        toast.success("Github Repo Saved")
        setGithubData(response.data.githubRepo);
        setIsEditing(false);
      }
    } catch (error) {
        toast.error("Failed to save")
        setspinner(false)
      console.error("Error updating GitHub data:", error);
    }
  };

  useEffect(() => {
    fetchGithubData();
  }, [teamId]);

  if (spinner) return <p><GridLoader color="#41a9be" /></p>;

  return (
    <div className={`github-container ${!githubData ? "center-content" : ""}`}>
      <Toaster toastOptions={{ duration: 4000 }} />
      <h3 className="github-header">GitHub Repository</h3>
      {githubData && githubData.userName && githubData.repo ? (
        <div className="github-info">
          <p>
            <strong>Username:</strong> {githubData.userName}
          </p>
          <p>
            <strong>Repository:</strong> {githubData.repo}
          </p>
          <button className="button" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </div>
      ) : (
        <div className="center-content">
          {!isEditing && <button className="button" onClick={() => setIsEditing(true)}>
            Add GitHub Repo
          </button>}
        </div>
      )}

      {isEditing && (
        <div className="edit-section">
          <h4>{githubData ? "Edit" : "Add"} GitHub Repository</h4>
          <label>GitHub Username:</label>
          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <label>Repository Name:</label>
          <input
            type="text"
            placeholder="Repository"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <button className="button" onClick={handleSave}>
            {spinner? <GridLoader color="#41a9be" size={5}/>:<span>Save</span>}
          </button>
          <button className="button cancel-button" style={{margin:'5px'}} onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      )}
        {githubData?.userName && githubData?.repo && (
            <GithubActivityFeed
                user={githubData.userName}
                repo={githubData.repo}
                limit={20}
            />
        )}
    </div>
  );
};

export default Github;

