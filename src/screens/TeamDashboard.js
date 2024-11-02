import React, { useState, useEffect,useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ContextApi from '../ContextAPI/ContextApi';
import KanBan from '../TaskComponent/Kanban'
import Timeline from '../EventConponents/Timeline'
import Timeline2 from '../EventConponents/Timeline2'
import Files from "./Files"
import "../css/TeamDashboard.css";
import EventBoard from '../EventConponents/EventBoard';
import Navbar from '../Components/Navbar';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import ActivityLog from './ActivityLog';
import ChatRoom from './ChatRoom';

const TeamDashboard = () => {

  const { user } = useContext(ContextApi); // Get the logged-in user
  const {component}=useParams();
  const location = useLocation(); // Access the current URL path

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  
  const [team, setTeam] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState(""); // For adding new members
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('1');
  const [status, setstatus] = useState("Dashboard")
  
  const [tasks, setTasks] = useState([]);


  useEffect(() => {
    // console.log(component)
    if(component=='dashboard'){
      setActiveKey("1")
    }else if(component=='files'){
      setActiveKey("2")
    }else if(component=='tasks'){
      setActiveKey("3")
    }else if(component=='timeline'){
      setActiveKey("4")
    }else if(component=='event-calendar'){
      setActiveKey("5")
    }else if(component=='chat-room'){
      setActiveKey("6")
    }else if(component=='activity-logs'){
      setActiveKey("7")
    }
    
  }, [component])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${user.teamId}/tasks`);
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
  }, [user]);

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };



  // Fetch team details
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${user.teamId}`);
        const data = await response.json();

        if (data.success) {
          setTeam(data.team);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team:', error);
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user]);



  if (loading) {
    return <div>Loading...</div>;
  }

  const handleTabSwitch = (eventKey) => {
    setActiveKey(eventKey);
    let newStatus;
  
    // Update status based on eventKey
    switch (eventKey) {
      case '1':
        newStatus = "Dashboard";
        break;
      case '2':
        newStatus = "Files";
        break;
      case '3':
        newStatus = "Tasks";
        break;
      case '4':
        newStatus = "Timeline";
        break;
      case '5':
        newStatus = "Event Calendar";
        break;
      case '6':
        newStatus = "Chat Room";
        break;
      default:
        newStatus = "Activity Logs";
        break;
    }
    const url = `${window.location.origin}/Team/${newStatus.toLowerCase().replace(" ", "-")}`;
    window.history.pushState({ path: url }, '', url);
  
    setstatus(newStatus);
  
    // Update URL to match the current tab
  };
  

  return (
    <div className="container-fluid team-dashboard-container">
      <Navbar teamName={team.teamName} activeKey={status} />
      <div className="row" style={{marginTop:'50px'}}>
        {isMobile? <div className="">
          <Sidebar activeKey={activeKey} onSelect={handleTabSwitch} />
        </div>:<div className="col-2">
          <Sidebar activeKey={activeKey} onSelect={handleTabSwitch} />
        </div>}
        <div className="col-12 col-sm-10">
          {activeKey === '1' && <Dashboard team={team} tasks={tasks}/>}
          {activeKey === '2' && <Files />}
          {activeKey === '3' && tasks && <KanBan task={tasks} />}
          {activeKey === '3' && <Timeline />}
          {activeKey === '4' && <Timeline2 />}
          {activeKey === '5' && <EventBoard />}
          {activeKey === '6' && <ChatRoom teamId={user.teamId} user={user}/>}
          {activeKey === '7' && <ActivityLog teamId={user.teamId}/>}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;