import React, { useState, useEffect, useContext } from "react";
import { Drawer, Button } from "rsuite";
import ContextApi from '../ContextAPI/ContextApi';
import "./EditTaskModal.css"; // Optional: for additional styling

const CreateTaskDrawer = ({ isOpen, onRequestClose, onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [tags, setTags] = useState("");
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("#000000");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [resource, setResource] = useState([]);

  const { user } = useContext(ContextApi); // Get the logged-in user
  const { name, teamId, id } = user;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [teamMembers, setTeamMembers] = useState([]);
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}`);
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.team.members);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };
    fetchTeamMembers();
  }, [user]);

  const handleCheckboxChange = (userId) => {
    setResource((prevResource) =>
      prevResource.includes(userId)
        ? prevResource.filter((id) => id !== userId)
        : [...prevResource, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      title,
      description,
      assignedBy: id,
      resource,
      status: 'To-Do',
      tags,
      progress: 0,
      color,
      start,
      end,
      id: id,
      name: name,
      teamId: teamId
    };

    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      const data = await response.json();

      if (data.success) {
        alert("Task created successfully!");
        onTaskCreated(data.task); // Update task list in parent component
        onRequestClose(); // Close the drawer after task creation
      } else {
        alert("Failed to create task.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("An error occurred while creating the task.");
    }
  };

  

  return (
    <Drawer
      open={isOpen}
      onClose={onRequestClose}
      size={isMobile? "full":"lg"} // Adjust size as needed (sm, md, lg, full)
      placement="right"
    >
      <Drawer.Header>
        <Drawer.Title>Create Task</Drawer.Title>
      <Drawer.Actions>
        <Button onClick={handleSubmit} appearance="primary">
          Create Task
        </Button>
        <Button onClick={onRequestClose} appearance="subtle">
          Cancel
        </Button>
      </Drawer.Actions>
      </Drawer.Header>

      <Drawer.Body>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Tags (comma separated)</label>
          <input
            type="text"
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <label>Progress</label>
          <input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
          />

          <label>Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

          <label>Start Date</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />

          <label>End Date</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />

          <h4>Assign to Team Members</h4>
          {teamMembers.map((member) => (
            <label key={member._id}>
              <input
                type="checkbox"
                value={member._id}
                onChange={() => handleCheckboxChange(member._id)}
              />
              {member.name}
            </label>
          ))}
        </form>
      </Drawer.Body>

    </Drawer>
  );
};

export default CreateTaskDrawer;
