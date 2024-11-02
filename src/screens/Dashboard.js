import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ReactSpeedometer from "react-d3-speedometer";
import "../css/dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ team, tasks }) {
  const [timelines, setTimelines] = useState([]);
  const [teamProgress, setTeamProgress] = useState(0);
  const [memberProgress, setMemberProgress] = useState({});
  const [memberTaskCounts, setMemberTaskCounts] = useState({});
  const [teamTaskCounts, setTeamTaskCounts] = useState({});
  const [teamHealthScore, setTeamHealthScore] = useState(0);
  const [logs, setLogs] = useState([]);

  const [notices, setNotices] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/teams/${team._id}/notices`);
        if (response.data.success) {
          setNotices(response.data.notices);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };
    fetchNotices();
  }, [team]);

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id}/activityLogs`
      );
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs.slice(0, 4)); // Store only the first 5 logs
      } else {
        alert("Failed to fetch activity logs.");
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      alert("An error occurred while fetching activity logs.");
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [team]);

  // Fetch timelines
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id}/timelines`
      );
      const data = await response.json();
      if (data.success) {
        setTimelines(data.timelines);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [team]);

  // Calculate team progress
  const calculateTeamProgress = useCallback(() => {
    if (timelines.length === 0) return 0;
    const totalProgress = timelines.reduce(
      (sum, timeline) => sum + (timeline.progress || 0),
      0
    );
    return totalProgress / timelines.length;
  }, [timelines]);

  // Calculate individual member progress and task counts
  const calculateMemberStats = useCallback(() => {
    const taskCountsByMember = {};
    const taskCountsByStatus = {
      Done: 0,
      "To-Do": 0,
      "In Progress": 0,
      Testing: 0,
    };

    tasks.forEach((task) => {
      // Update task status counts for the whole team
      taskCountsByStatus[task.status] =
        (taskCountsByStatus[task.status] || 0) + 1;

      // Update member-specific task status counts
      task.resource.forEach((member) => {
        if (!taskCountsByMember[member._id]) {
          taskCountsByMember[member._id] = {
            Done: 0,
            "To-Do": 0,
            "In Progress": 0,
            Testing: 0,
            totalTasks: 0,
          };
        }
        // Increment task status count for this member
        taskCountsByMember[member._id][task.status] += 1;
        taskCountsByMember[member._id].totalTasks += 1;
      });
    });

    // Calculate percentage of "Done" tasks for each member
    const calculatedMemberProgress = {};
    for (const [memberId, counts] of Object.entries(taskCountsByMember)) {
      const doneTasks = counts["Done"] || 0;
      const totalTasks = counts.totalTasks || 0;
      calculatedMemberProgress[memberId] =
        totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
    }

    setMemberProgress(calculatedMemberProgress);
    setMemberTaskCounts(taskCountsByMember);
    setTeamTaskCounts(taskCountsByStatus);
  }, [tasks]);

  // Calculate overall team health score
  const calculateTeamHealthScore = useCallback(() => {
    const totalMembers = team.members.length;

    // 1. Team Progress Weight (50% of health score)
    const teamProgressWeight = teamProgress;

    // 2. Member Progress Weight (30% of health score)
    const avgMemberProgress =
      Object.values(memberProgress).reduce(
        (sum, progress) => sum + progress,
        0
      ) / totalMembers;

    // 3. Task Status Score (20% of health score)
    const totalTasks = Object.values(teamTaskCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const completedTasks = teamTaskCounts["Done"] || 0;
    const taskStatusScore =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Weighted health score calculation
    const healthScore =
      teamProgressWeight * 0.5 +
      avgMemberProgress * 0.3 +
      taskStatusScore * 0.2;
    return healthScore;
  }, [teamProgress, memberProgress, teamTaskCounts, team.members.length]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const teamProgressValue = calculateTeamProgress();
    setTeamProgress(teamProgressValue);
  }, [calculateTeamProgress]);

  useEffect(() => {
    calculateMemberStats();
  }, [calculateMemberStats]);

  useEffect(() => {
    const healthScore = calculateTeamHealthScore();
    setTeamHealthScore(parseInt(healthScore));
  }, [calculateTeamHealthScore]);

  // Helper function to generate chart data
  const generateChartData = (data) => ({
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
      },
    ],
  });

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-sm-8">
          <div style={isMobile? {margin:0}:{}} className="notice-board">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{ fontWeight: "bold" }}
                className="notice-board-title"
              >
                Hack2Hire Notice Board
              </span>
              {!isMobile && <span
                style={{ fontWeight: "bolder", color: "#3e98c7" }}
                className="notice-board-title"
              >
                Team Leader: {team.leaderUserId.name}
              </span>}
            </div>

            <div className="notice-list">
              {notices.map((notice, index) => (
                <div key={index} className="notice-item">
                  <h3 className="notice-title">{notice.title}</h3>
                  <p className="notice-date">{new Date(notice.date).toLocaleString()}</p>
                  <p className="notice-description">{notice.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="container text-center">
            {isMobile? <h5 style={{ margin: "50px" }}>Team Members Stats</h5>:<h2 style={{ margin: "50px" }}>Team Members Stats</h2>}
            <div className="row">
              {team.members.map((member) => {
                // Calculate filteredTaskCounts before returning JSX
                const filteredTaskCounts = Object.fromEntries(
                  Object.entries(memberTaskCounts[member._id] || {}).filter(
                    ([key]) => key !== "totalTasks"
                  )
                );

                return (
                  <>
                    <div key={member._id} style={isMobile?{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}:{}} className="col-12 col-sm-6">
                      <h3 className="" style={{color:'#3e98c7'}}>
                        {member.name}
                      </h3>

                      <div
                        className=""
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding:'10px'
                        }}
                      >
                        <div className="text-center" style={{padding:'10px'}}>
                          <Doughnut
                            data={generateChartData(filteredTaskCounts)}
                            width={170}
                            height={170}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  display: false,
                                },
                              },
                            }}
                          />
                          <div className="text-center" style={{bottom:15}}><span>&nbsp;&nbsp;&nbsp;Task Status</span></div>
                        </div>
                        <div className="text-center" style={{ width: "auto", height: "auto" }}>
                          <CircularProgressbar
                            value={memberProgress[member._id]}
                            text={`${parseInt(memberProgress[member._id])}%`}
                            background
                            backgroundPadding={6}
                            styles={buildStyles({
                              backgroundColor: "#3e98c7",
                              textColor: "#fff",
                              pathColor: "#fff",
                              trailColor: "transparent",
                              pathTransitionDuration: 2,
                              height:'20px'
                            })}
                          />
                          <div className="text-center" style={{position:'absolute', bottom:20}}>Task Completed</div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
          {!isMobile &&<div className="notice-board">
            <h2 className="notice-board-title">Activity Logs (Last 5)</h2>
            <div className="notice-list">
              {logs.map((log, index) => (
                <div key={index} className="activity-item">
                  <p className="notice-date">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  <p className="notice-description">{log.userName} {log.description}</p>
                </div>
              ))}
            </div>
          </div>}
        </div>

        <div className="col-12 col-sm-4">
          <div className="notice-board">
            <h2 className="notice-board-title">Team Metrics</h2>
            <div className="notice-list">
              <div className="metrics-item text-center">
                {teamHealthScore && (
                  <ReactSpeedometer
                    maxValue={100}
                    value={teamHealthScore}
                    currentValueText={`Team Health Score: ${teamHealthScore}`}
                    width={isMobile? 250:300}
                    height={isMobile? 150:180}
                    forceRender
                    needleTransitionDuration={4000}
                    needleTransition="easeElastic"
                    segmentColors={["#d62915", "lightgrey"]}
                    customSegmentStops={[0, teamHealthScore, 100]}
                    customSegmentLabels={[
                      {
                        // text: teamHealthScore,
                        position: "OUTSIDE",
                        color: "Black",
                      },
                      {
                        text: "",
                        position: "OUTSIDE",
                        color: "green",
                      },
                    ]}
                  />
                )}
              </div>
              <div className="metrics-item text-center">
                <Doughnut
                  data={generateChartData(teamTaskCounts)}
                  width={200}
                  height={200}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
                <h3 className="notice-title">Team Task Status</h3>
              </div>
              <div
                className="metrics-item text-center"
                style={{ padding: "50px" }}
              >
                <CircularProgressbar
                  value={teamProgress.toFixed(2)}
                  text={`${teamProgress.toFixed(2)}%`}
                  background
                  backgroundPadding={6}
                  styles={{
                    backgroundColor: "",
                    textColor: "#d62915;",
                    pathColor: "#d62915",
                    trailColor: "transparent",
                  }}
                />
                <h3 className="notice-title">Overall Team Progress</h3>
              </div>
            </div>
          </div>
          <br />
          
        </div>
      </div>
    </div>
  );
}
