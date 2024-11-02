import React, { useState, useEffect } from 'react';
import 'rsuite/dist/rsuite.min.css';
import { Sidenav, Nav } from 'rsuite';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import TaskIcon from '@rsuite/icons/Task';
import CalendarIcon from '@rsuite/icons/Calendar';
import TimeIcon from '@rsuite/icons/Time';
import PageIcon from '@rsuite/icons/Page';
import WechatIcon from '@rsuite/icons/Wechat';

import '../css/Sidebar.css'

const Sidebar = ({ activeKey, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle expand/collapse in mobile view
  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className={isMobile ? "sidebar-mobile-icons" : "sidebar-desktop"}>
      {isMobile ? (
        <div className="icon-navbar">
          <Nav className='sidebar-mobile-icons' vertical activeKey={activeKey} onSelect={onSelect} appearance="inverse">
            <Nav.Item eventKey="1" icon={<DashboardIcon />} ></Nav.Item>
            <Nav.Item eventKey="2" icon={<FolderFillIcon />} ></Nav.Item>
            <Nav.Item eventKey="3" icon={<TaskIcon />} ></Nav.Item>
            <Nav.Item eventKey="4" icon={<TimeIcon />} ></Nav.Item>
            <Nav.Item eventKey="5" icon={<CalendarIcon />} ></Nav.Item>
            <Nav.Item eventKey="6" icon={<WechatIcon />} ></Nav.Item>
            <Nav.Item eventKey="7" icon={<PageIcon />} ></Nav.Item>
          </Nav>
        </div>
      ) : (
        <Sidenav
          expanded={expanded}
          defaultOpenKeys={['3', '4']}
          style={{ borderRadius: '20px', position: 'sticky', top: '80px' }}
        >
          <Sidenav.Body>
            <Nav activeKey={activeKey} onSelect={onSelect} appearance="inverse">
              <Nav.Item eventKey="1" icon={<DashboardIcon />}>Dashboard</Nav.Item>
              <Nav.Item eventKey="2" icon={<FolderFillIcon />}>Files</Nav.Item>
              <Nav.Item eventKey="3" icon={<TaskIcon />}>Task</Nav.Item>
              <Nav.Item eventKey="4" icon={<TimeIcon />}>Timeline</Nav.Item>
              <Nav.Item eventKey="5" icon={<CalendarIcon />}>Event Calendar</Nav.Item>
              <Nav.Item eventKey="6" icon={<WechatIcon />}>Chat Room</Nav.Item>
              <Nav.Item eventKey="7" icon={<PageIcon />}>Activity Logs</Nav.Item>
            </Nav>
          </Sidenav.Body>
          <Sidenav.Toggle onToggle={(expanded) => setExpanded(expanded)} />
        </Sidenav>
      )}
    </div>
  );
};

export default Sidebar;
