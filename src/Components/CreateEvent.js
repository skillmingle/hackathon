import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../css/CreateEvent.css"; // Assuming you have a CSS file for styling

const CreateEvent = ({ onEventCreated }) => {
  const { teamId } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventData = {
      eventName,
      description,
      start,
      end,
      tags: tags.split(",").map(tag => tag.trim()), // Split tags by commas
    };

    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (data.success) {
        alert("Event created successfully!");
        setShowForm(false); // Hide the form
        onEventCreated(data.event); // Optional: to refresh event list
      } else {
        alert("Failed to create event");
      }
    } catch (error) {
      //console.error("Error creating event:", error);
    }
  };

  return (
    <div className="create-event">
      <button onClick={() => setShowForm(!showForm)} className="create-event-button">
        {showForm ? "Cancel" : "Create Event"}
      </button>

      {showForm && (
        <form className="event-form" onSubmit={handleSubmit}>
          <label>Event Name:</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />

          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Start:</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />

          <label>End:</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />

          <label>Tags (comma-separated):</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <button type="submit" className="submit-button">Submit</button>
        </form>
      )}
    </div>
  );
};

export default CreateEvent;
