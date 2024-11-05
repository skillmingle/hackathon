import React, { useContext, useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";
import "./TaskCard.css";
import ContextApi from '../ContextAPI/ContextApi';
import { toast, Toaster } from "react-hot-toast";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "short" };
  return date.toLocaleDateString("en-GB", options).replace(",", "");
};

const TaskCard = ({ item, index, onEdit, onClick, onDeleteTask }) => {
  const { user } = useContext(ContextApi);
  const { id} = user; // Get the user ID from context

  // Function to check if the task is assigned by an admin
  const isAdmin = () => {
    return item.assignedBy._id === "6729ecd7e291eab9786439ed" || item.assignedBy._id === "672a0c8fae10ec7340b1b488";
  };

  return (
    <Draggable key={item._id} draggableId={item._id} index={index}>

      {(provided) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // Apply background color if assigned by admin
          style={{ backgroundColor: isAdmin() ? 'lightgreen' : 'white' }}
        >
          <div className="card-content">
            <div className="heading">{item.title}</div>
            <p className="description">
              {item.description.split(" ").slice(0, 10).join(" ")}
              {item.description.split(" ").length > 10 && "..."}
            </p>
            <div className="due-date">
              <small>{item.end ? formatDate(item.end) : "N/A"}</small>
            </div>
            <div className="assigned-to">
              <span className="subtitle">Assigned To:</span>{" "}
              <span className="assigned-names">
                {item.resource.map((user) => user.name).join(", ")}
              </span>
            </div>
            <div className="button-group">
              <i className="fas fa-eye task-icon" onClick={onClick} title="View"></i>
              {/* Show edit and delete icons only if the task was assigned by the current user */}
              {item.assignedBy._id === id && (
                <>
                  <i className="fas fa-edit task-icon" onClick={onEdit} title="Edit"></i>
                  <i className="fas fa-trash-alt task-icon" onClick={onDeleteTask} title="Delete"></i>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;

// toast.success("applied succesfully")
// <Toaster toastOptions={{ duration: 4000 }} />
//       toast.error("not retrieved");
