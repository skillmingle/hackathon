import React from "react";
import { Drawer, Button } from "rsuite";
import "./TaskDetailsDrawer.css"; // Styling for the task details drawer

const TaskDetailsDrawer = ({ isOpen, onRequestClose, task }) => {
  return (
    <Drawer
      open={isOpen}
      onClose={onRequestClose}
      size="lg"
      placement="right"
      className="custom-task-drawer"
    >
      <Drawer.Header className="drawer-header">
        <Drawer.Title>{task.title}</Drawer.Title>
        <Drawer.Actions >
          <Button onClick={onRequestClose} appearance="primary" className="close-button">
            Close
          </Button>
        </Drawer.Actions>
      </Drawer.Header>
      
      <Drawer.Body className="drawer-body">
        <div className="task-details">
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Progress:</strong> {task.progress}%</p>
          <p><strong>Color:</strong> <span className="color-box" style={{ backgroundColor: task.color }}>{task.color}</span></p>
          <p><strong>Start Date:</strong> {new Date(task.start).toLocaleString()}</p>
          <p><strong>End Date:</strong> {new Date(task.end).toLocaleString()}</p>
          
          <div className="task-modal-tags">
            <strong>Tags:</strong>
            <div className="tags-container">
              {task.tags.map((tag, index) => (
                <span key={index} className="tag-box">{tag}</span>
              ))}
            </div>
          </div>

          <p><strong>Assigned To:</strong> {task.resource.map((user) => user.name).join(", ")}</p>
        </div>
      </Drawer.Body>
      
    </Drawer>
  );
};

export default TaskDetailsDrawer;
