import React, { useState, useContext } from 'react';
import ContextApi from './ContextAPI/ContextApi';

const CreateProjectForm = () => {
  const { user } = useContext(ContextApi); // Fetch the logged-in user's information
  const [formData, setFormData] = useState({ projectName: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://h2h-backend-7ots.onrender.com/api/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: formData.projectName,
          description: formData.description,
          userId: user.id, // Pass the logged-in user's ID
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true); // Set success state if project creation is successful
      } else {
        setError(data.message || 'Failed to create project');
      }
    } catch (err) {
      //console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="create-project-form-container">
      <h2>Create New Project</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Project created successfully!</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="projectName"
          placeholder="Project Name"
          value={formData.projectName}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Project</button>
      </form>
    </div>
  );
};

export default CreateProjectForm;
