import React from 'react';
import 'rsuite/dist/rsuite.min.css';
import { Sidenav, Nav } from 'rsuite';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import TaskIcon from '@rsuite/icons/Task';
import CalendarIcon from '@rsuite/icons/Calendar';
import TimeIcon from '@rsuite/icons/Time';
import PageIcon from '@rsuite/icons/Page';
import WechatIcon from '@rsuite/icons/Wechat';

const Sidebar = ({ activeKey, onSelect }) => {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div style={{position:'sticky', top:'80px'}}>
      <Sidenav style={{borderRadius:'20px' }} expanded={expanded} defaultOpenKeys={['3', '4']}>
        <Sidenav.Body>
          <Nav activeKey={activeKey} onSelect={onSelect} appearance="inverse">
            <Nav.Item eventKey="1" icon={<DashboardIcon />}>
              Dashboard
            </Nav.Item>
            <Nav.Item eventKey="2" icon={<FolderFillIcon />}>
              Files
            </Nav.Item>
            <Nav.Item eventKey="3" icon={<TaskIcon />}>
              Task
            </Nav.Item>
            <Nav.Item eventKey="4" icon={<TimeIcon />}>
              Timeline
            </Nav.Item>
            <Nav.Item eventKey="5" icon={<CalendarIcon />}>
              Event Calendar
            </Nav.Item>
            <Nav.Item eventKey="6" icon={<WechatIcon />}>
              Chat Room
            </Nav.Item>
            <Nav.Item eventKey="7" icon={<PageIcon />}>
              Activity Logs
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
        <Sidenav.Toggle onToggle={(expanded) => setExpanded(expanded)} />
      </Sidenav>
    </div>
  );
};

export default Sidebar;
