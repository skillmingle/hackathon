import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/CreateNotice.css";

const CreateNotice = ({projectId, teams, userId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);



  // Handle checkbox changes
  const handleTeamSelection = (teamId) => {
    setSelectedTeams((prevSelected) =>
      prevSelected.includes(teamId) ? prevSelected.filter(id => id !== teamId) : [...prevSelected, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://h2h-backend-7ots.onrender.com/api/notices", {
        title,
        description,
        selectedTeams,
        projectId,
        sendToAll,
        userId
      });

      if (response.data.success) {
        alert("Notice created and sent successfully!");
        setTitle("");
        setDescription("");
        setSelectedTeams([]);
        setSendToAll(false);
      }
    } catch (error) {
      //console.error("Error creating notice:", error);
      alert("Failed to create notice.");
    }
  };

  return (
    <form className="create-notice-form" onSubmit={handleSubmit}>
      <h2>Create Notice</h2>
      <label>
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={sendToAll}
          onChange={(e) => {
            setSendToAll(e.target.checked);
            setSelectedTeams([]); // Clear team selection if "send to all" is checked
          }}
        />
        Send to All Teams
      </label>
      {!sendToAll && (
        <div className="team-checkboxes">
          <h4>Select Teams</h4>
          {teams.map((team) => (
            <label key={team._id}>
              <input
                type="checkbox"
                value={team._id}
                onChange={() => handleTeamSelection(team._id)}
                checked={selectedTeams.includes(team._id)}
              />
              {team.teamName}
            </label>
          ))}
        </div>
      )}
      <button type="submit">Send Notice</button>
    </form>
  );
};

export default CreateNotice;
