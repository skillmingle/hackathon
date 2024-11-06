// src/components/Kanban.js
import React, { useState, useEffect, useContext } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, Box, Button } from "@mui/material";
import axios from "axios";
import TaskCard from "./TaskCard";
import ContextApi from '../ContextAPI/ContextApi';
import EditTaskForm from "./EditTaskForm";
import CreateTaskForm from "./CreateTaskForm";
import TaskDetailsModal from "./TaskDetailsModal";
import { toast, Toaster } from "react-hot-toast";

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

const Kanban = ({ task }) => {
  const [columns, setColumns] = useState({
    "todo-column": { title: "To-Do", items: [] },
    "inprogress-column": { title: "In Progress", items: [] },
    "testing-column": { title: "Testing", items: [] },
    "done-column": { title: "Done", items: [] },
  });
  const [tasks, setTasks] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useContext(ContextApi);
  const { name, teamId, id } = user;

  const fetchTasks = async () => {
    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}/tasks`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      toast.error("Error fetching tasks");
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const taskColumns = {
      "To-Do": [],
      "In Progress": [],
      "Testing": [],
      "Done": [],
    };

    tasks.forEach((task) => {
      taskColumns[task.status].push(task);
    });

    setColumns({
      "todo-column": { title: "To-Do", items: taskColumns["To-Do"] },
      "inprogress-column": { title: "In Progress", items: taskColumns["In Progress"] },
      "testing-column": { title: "Testing", items: taskColumns["Testing"] },
      "done-column": { title: "Done", items: taskColumns["Done"] },
    });
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
      movedTask.status = destColumn.title;
      destItems.splice(destination.index, 0, movedTask);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });

      try {
        await axios.put(`https://h2h-backend-7ots.onrender.com/api/tasks/${draggableId}`, { status: movedTask.status, userId: id, name, teamId });
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId, title) => {
    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, id, name, title }),
      });
      const data = await response.json();
      if (data.success) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        toast.success("Task deleted successfully.");
      } else {
        toast.error("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("An error occurred while deleting the task.");
    }
  };


  const confirmDelete = (taskId, title) => {
    toast((t) => (
      <span>
        Are you sure you want to delete this task?
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              handleDeleteTask(taskId, title);
              toast.dismiss(t.id); // Dismiss the toast after deletion
            }}
            style={{ background: 'red', color: 'white', padding: '4px 8px', borderRadius: '4px' }}
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ padding: '4px 8px', borderRadius: '4px' }}
          >
            Cancel
          </button>
        </div>
      </span>
    ));
  };

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
    fetchTasks();
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <Toaster toastOptions={{ duration: 4000 }} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Container>
          <Grid container spacing={2}>
            {Object.entries(columns).map(([columnId, column]) => (
              <Grid item xs={12} sm={6} md={3} key={columnId}>
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <TaskList
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      isDraggingOver={snapshot.isDraggingOver}
                      columnTitle={column.title}
                    >
                      <Title>{column.title}</Title>
                      {column.items.map((item, index) => (
                        <TaskCard
                          key={item._id}
                          item={item}
                          index={index}
                          onEdit={() => handleEdit(item)}
                          onClick={() => handleTaskClick(item)}
                          onDeleteTask={() => confirmDelete(item._id,item.title)}
                        />
                      ))}
                      {provided.placeholder}
                      {column.title === "To-Do" && (
                        <Button variant="text" onClick={() => setIsCreateModalOpen(true)}>
                          + New Task
                        </Button>
                      )}
                    </TaskList>
                  )}
                </Droppable>
              </Grid>
            ))}
          </Grid>
        </Container>
      </DragDropContext>

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
    </>
  );
};

export default Kanban;
