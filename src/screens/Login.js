import React, { useState, useContext } from 'react';
import ContextApi from '../ContextAPI/ContextApi';
import { useNavigate, Link } from 'react-router-dom';
import "../css/Login&Signup.css";
import { toast, Toaster } from "react-hot-toast";
import GridLoader from "react-spinners/GridLoader";

const Login = () => {
  const { setuser } = useContext(ContextApi);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [spinner, setspinner] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setspinner(true)
    try {
      const res = await fetch('https://h2h-backend-7ots.onrender.com/api/login/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setspinner(false)
      if (data.success) {
        localStorage.setItem('userData', JSON.stringify(data.user));
        //console.log(data);
        setuser(data.user);
        if(data.user.email=='sachin@gmail.com'||data.user.email=='sahil@gmail.com'){
          navigate("/AdminH2HDashboard", { state: data.user.email });

        }else{
          navigate('/Team/Dashboard');
        }
      } else {
        toast.error(data.message ||'Login failed')
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      //console.error(err);
      toast.error('Something went wrong. Please try again.')
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <Toaster toastOptions={{ duration: 4000 }} />
      <div className="auth-header">
        <h1>Welcome to Hack2Hire</h1>
        <p>Join the journey to innovation and excellence</p>
      </div>
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        {spinner? <GridLoader color="#41a9be" size={10}/>:
        <button type="submit">Login</button>}
      </form>
    </div>
  );
};

export default Login;
