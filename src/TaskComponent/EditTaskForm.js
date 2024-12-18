import React, { useState, useEffect, useContext } from "react";
import { Drawer, Button } from "rsuite";
import "./EditTaskModal.css"; // Optional: for additional styling
import ContextApi from '../ContextAPI/ContextApi';
import { toast, Toaster } from "react-hot-toast";
import GridLoader from "react-spinners/GridLoader";

const EditTaskDrawer = ({ isOpen, onRequestClose, task, onUpdate }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [tags, setTags] = useState(task.tags.join(", "));
  const [progress, setProgress] = useState(task.progress || 0);
  const [color, setColor] = useState(task.color || "#000000");
  const [start, setStart] = useState(task.start);
  const [end, setEnd] = useState(task.end);
  const [resource, setResource] = useState(task.resource.map((r) => r._id));
  const [spinner, setspinner] = useState(false)

  const { user } = useContext(ContextApi); // Get the logged-in user
  const { name, teamId, id } = user;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCheckboxChange = (userId) => {
    setResource((prevResource) =>
      prevResource.includes(userId)
        ? prevResource.filter((id) => id !== userId)
        : [...prevResource, userId]
    );
  };

  const [teamMembers, setTeamMembers] = useState([]);
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}`);
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.team.members);
        }
      } catch (error) {
        //console.error("Error fetching team members:", error);
      }
    };
    fetchTeamMembers();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setspinner(true)
    const updatedTaskData = {
      title,
      description,
      resource,
      status,
      tags,
      progress,
      color,
      start,
      end,
      id: id,
      name: name,
      teamId: teamId
    };

    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/tasks/edit/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTaskData),
      });
      const data = await response.json();
      setspinner(false)
      if (data.success) {
        toast.success("Task Updated")
        onUpdate(data.task); // Update the task list in parent component
        onRequestClose(); // Close the drawer
      } else {
        toast.error("Failed to update task.");
      }
    } catch (error) {
      //console.error("Error updating task:", error);
      toast.error("An error occurred while updating the task.");
    }
  };

  return (
    <>
    <Toaster toastOptions={{ duration: 4000 }} />
    <Drawer open={isOpen} onClose={onRequestClose} size={isMobile? "full":"lg"} placement="right">
      <Drawer.Header className="drawer-header">
        <Drawer.Title>Edit Task</Drawer.Title>
        <Drawer.Actions>
        {spinner? <GridLoader color="#41a9be" size={10}/>:
          <Button onClick={handleSubmit} appearance="primary">
            Update Task
          </Button>}
          <Button onClick={onRequestClose} appearance="subtle">
            Cancel
          </Button>
        </Drawer.Actions>
      </Drawer.Header>

      <Drawer.Body>
        <form onSubmit={handleSubmit}>
        <label>Title</label>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            />
          <label>Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Tags (comma separated)</label>
          <input
            type="text"
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

          <label>Color&nbsp;&nbsp;&nbsp;</label>
          <input className="color-box" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <br/>
          <label>Start Date</label>
          <input
            type="datetime-local"
            value={new Date(start).toISOString().slice(0, -8)}
            onChange={(e) => setStart(e.target.value)}
            required
            />

          <label>End Date</label>
          <input
            type="datetime-local"
            value={new Date(end).toISOString().slice(0, -8)}
            onChange={(e) => setEnd(e.target.value)}
            required
            />

          <h4>Assign to Team Members</h4>
          {teamMembers.map((member) => (
            <label key={member._id}>
              <input
                type="checkbox"
                checked={resource.includes(member._id)}
                onChange={() => handleCheckboxChange(member._id)}
              />
              {member.name}
            </label>
          ))}
        </form>
      </Drawer.Body>

    </Drawer>
                </>
  );
};

export default EditTaskDrawer;
