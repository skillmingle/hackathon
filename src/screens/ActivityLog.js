import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import GridLoader from "react-spinners/GridLoader";

const ActivityLog = ({ teamId }) => {
  const [logs, setLogs] = useState([]);
  const team= teamId

  const [spinner, setspinner] = useState(false)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch activity logs for a team
  const fetchActivityLogs = async (teamId) => {
    try {
      const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${team}/activityLogs`);
      const data = await response.json();
      if (data.success) {
        setspinner(false)
        setLogs(data.logs);

      }
    } catch (error) {
      setspinner(false)

      console.error("Error fetching activity logs:", error);
      toast.error("An error occurred while fetching activity logs.");
    }
  };

  useEffect(() => {
    setspinner(true)
    fetchActivityLogs();
  }, [team]);

  return (
    <div>
      <Toaster toastOptions={{ duration: 4000 }} />
      {spinner &&<GridLoader color="#41a9be" />}

      <table class="table">
        <thead class="thead-light">
          <tr>
            {!isMobile &&<th scope="col">#</th>}
            <th scope="col">Timestamp</th>
            <th scope="col">Name</th>
            {!isMobile &&<th scope="col">Description</th>}
            <th scope="col">Operation</th>
          </tr>
        </thead>
        <tbody>
        {logs.map((log,index) => (
                <tr key={log._id} style={{ paddingLeft:'20px',}}>
                  {!isMobile &&<th scope="row">{index+1}</th>}
                  <td><strong>{new Date(log.timestamp).toLocaleString()}</strong></td>
                  <td>{log.userName}</td>
                  {!isMobile &&<td>{log.description}</td>}
                  <td><span style={{borderRadius:'5px', border:'1px solid grey', padding:'1px 5px'}}>{log.action} </span></td>
                </tr>
              ))}    
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLog;
