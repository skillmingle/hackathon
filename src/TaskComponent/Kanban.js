
// src/components/KanbanBoard.js
import React, { useState, useEffect, useContext } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, Box, Button, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import TaskCard from "./TaskCard";
import ContextApi from '../ContextAPI/ContextApi';
import EditTaskForm from "./EditTaskForm";
import CreateTaskForm from "./CreateTaskForm";
import "./EditTaskModal.css"; // Optional: for additional styling
import TaskDetailsModal from "./TaskDetailsModal";
import { toast, Toaster } from "react-hot-toast";
import GridLoader from "react-spinners/GridLoader";
import { set } from "rsuite/esm/internals/utils/date";

const Container = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  [theme?.breakpoints?.up("sm")]: {
    flexDirection: "row",
  },
  padding: "10px",
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
  minWidth: "280px",
  borderRadius: "5px",
  padding: "15px 15px",
  marginBottom: "10px",
}));

const Title = styled("span")(() => ({
  fontWeight: "bold",
  color: "#333333",
  fontSize: 16,
  marginBottom: "3px",
}));

const Kanban = () => {
  const [columns, setColumns] = useState();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [tasks, setTasks] = useState(null);
  const { user } = useContext(ContextApi);
  const { name, teamId, id } = user;
  const userId = id;
  const [spinner, setspinner] = useState(false)

  const fetchTasks = async () => {
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
    setspinner(true)
    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}/tasks`);
      const data = await response.json();
      setspinner(false)
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      toast.error("Error fetching taska")
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchx(); // Fetch tasks first
      fetchTasks(); // Then populate the columns based on fetched tasks
    };
  
    fetchData();
  }, [tasks]); // Run this whenever tasks change
  

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
        await axios.put(`https://h2h-backend-7ots.onrender.com/api/tasks/${draggableId}`, { status: movedTask.status, userId, name, teamId });
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId, title) => {
    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          teamId: teamId,
          id: id,
          name: name,
          title: title
        }),
      });
      const data = await response.json();

      if (data.success) {
        fetchx();
        toast.success("Task deleted successfully.");
      } else {
        toast.error("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("An error occurred while deleting the task.");
    }
  };

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const onUpdate = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
    setIsEditModalOpen(false);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const onTaskCreated = (newTask) => {
    fetchx();
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setIsCreateModalOpen(false);
  };

  return (
    <>
    <Toaster toastOptions={{ duration: 4000 }} />
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        {columns && tasks && (
          <Grid container spacing={2}>
            {Object.entries(columns).map(([columnId, column], index) => (
              <Grid item xs={12} sm={6} md={3} key={columnId}>
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

                      {column.items.map((item, index) => (
                        <TaskCard key={item._id} item={item} index={index} onEdit={() => handleEdit(item)} onClick={() => handleTaskClick(item)} onDeleteTask={() => handleDeleteTask(item._id, item.title, item.assignedBy)} />
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
              </Grid>
            ))}
          </Grid>
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

      {isEditModalOpen && selectedTask && (
        <EditTaskForm
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        onUpdate={onUpdate}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        task={selectedTask}
        />
      )}
    </DragDropContext>
      </>
  );
};

export default Kanban;


