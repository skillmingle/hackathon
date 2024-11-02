// src/components/KanbanBoard.js
import React, { useState, useEffect, useContext } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, Box, Button, TextField } from "@mui/material";
import Divider from "@mui/material/Divider";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import TaskCard from "./TaskCard";
import CreateTask from "../Components/CreateTask"; // Import CreateTask component
import ContextApi from '../ContextAPI/ContextApi';
import EditTaskForm from "./EditTaskForm";
import CreateTaskForm from "./CreateTaskForm";
import "./EditTaskModal.css"; // Optional: for additional styling
import TaskDetailsModal from "./TaskDetailsModal";

const Container = styled("div")(() => ({
  display: "flex",
  flexDirection: "row",
}));

const getColumnBackgroundColor = (title) => {
  switch (title) {
    case "To-Do":
      return "#f5f5f5";
    case "In Progress":
      return "#e3f2fd";
    case "Testing":
      return "#fff9c4";
    case "Done":
      return "#e8f5e9";
    default:
      return "#d7dce8";
  }
};

const TaskList = styled("div")(({ columnTitle }) => ({
  minHeight: "100px",
  display: "flex",
  flexDirection: "column",
  backgroundColor: getColumnBackgroundColor(columnTitle),
  minWidth: "290px",
  borderRadius: "5px",
  padding: "5px 5px",
  marginRight: "10px",
}));

const TaskColumnStyles = styled("div")(() => ({
  margin: "4px",
  display: "flex",
  width: "100%",
  minHeight: "300px",
}));

const Title = styled("span")(() => ({
  fontWeight: "bold",
  color: "#333333",
  fontSize: 16,
  marginBottom: "3px",
}));

const Kanban = ({ task}) => {
  const [columns, setColumns] = useState();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [tasks, setTasks] = useState(task);

  const { user } = useContext(ContextApi); // Get the logged-in user
    const {name,teamId,id} = user
const userId=id


const fetchTasks = async () => {
  console.log(tasks)
  try {
    const taskColumns = {
      "To-Do": [],
      "In Progress": [],
      "Testing": [],
        "Done": [],
      };
      
      tasks?.forEach((task) => {
        taskColumns[task.status].push(task);
      });
      
      setColumns({
        [uuidv4()]: { title: "To-Do", items: taskColumns["To-Do"] },
        [uuidv4()]: { title: "In Progress", items: taskColumns["In Progress"] },
        [uuidv4()]: { title: "Testing", items: taskColumns["Testing"] },
        [uuidv4()]: { title: "Done", items: taskColumns["Done"] },
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
    const fetchx = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}/tasks`);
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
  }, [tasks]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [movedTask] = sourceItems.splice(source.index, 1);
      movedTask.status = columns[destination.droppableId].title;
      destItems.splice(destination.index, 0, movedTask);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });

      try {
        await axios.put(`http://localhost:5000/api/tasks/${draggableId}`, { status: movedTask.status,userId,name,teamId });
        console.log("Task status updated successfully");
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

    // Handle task deletion
    const handleDeleteTask = async (taskId,title) => {
      console.log(taskId)
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },        
          body: JSON.stringify({
            teamId:teamId,
            id:id,
            name:name,
            title:title
          }),
        });
        const data = await response.json();
  
        if (data.success) {
          fetchx()
          alert("Task deleted successfully.");
        } else {
          alert("Failed to delete task.");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("An error occurred while deleting the task.");
      }
    };



  const [selectedTask, setSelectedTask] = useState(null); // Track the task being edited
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Track modal visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Track modal visibility

  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility

  // Open the modal with the selected task
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };


  const onUpdate = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
    setIsEditModalOpen(false); // Close the modal after update
  };

  // Open the edit modal with the selected task
  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true); // Show the edit modal
  };

    // Handle adding a new task
    const onTaskCreated = (newTask) => {
      fetchx()
      setTasks((prevTasks) => [...prevTasks, newTask]); // Update task list in parent component
      setIsCreateModalOpen(false); // Close the modal after creating a task
    };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        {columns && (
          <TaskColumnStyles>
            {Object.entries(columns).map(([columnId, column], index) => (
              <Droppable key={index} droppableId={columnId}>
                {(provided, snapshot) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={snapshot.isDraggingOver}
                    columnTitle={column.title}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Grid
                        container
                        rowSpacing={1}
                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                      >
                        <Grid item xs={10} key={index}>
                          <Title>{column.title}</Title>
                        </Grid>
                      </Grid>
                    </Box>
                    <Divider />

                    {column.items.map((item, index) => (
                      <TaskCard key={item._id} item={item} index={index} onEdit={() => handleEdit(item)} onClick={() => handleTaskClick(item)} onDeleteTask={() => handleDeleteTask(item._id,item.title)}/>
                    ))}
                    {provided.placeholder}

                    {column.title === "To-Do" && (
                      <Button
                        variant="text"
                        onClick={() => setIsCreateModalOpen(true)}
                        
                      >
                        + New Task
                      </Button>
                    )}
                  </TaskList>
                )}
              </Droppable>
            ))}
          </TaskColumnStyles>
        )}
      </Container>
      {isCreateModalOpen && (
        <CreateTaskForm
          isOpen={isCreateModalOpen}
          onRequestClose={() => setIsCreateModalOpen(false)}
          teamId={teamId}
          onTaskCreated={onTaskCreated}
        />
      )}

      {/* Render EditTaskForm inside a modal if isEditModalOpen is true */}
      {isEditModalOpen && selectedTask && (
        <EditTaskForm
          isOpen={isEditModalOpen}
          onRequestClose={() => setIsEditModalOpen(false)}
          task={selectedTask}
          onUpdate={onUpdate}
        />
      )}

      {/* Render TaskDetailsModal if a task is selected */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          task={selectedTask}
        />
      )}
    </DragDropContext>
  );
};

export default Kanban;
