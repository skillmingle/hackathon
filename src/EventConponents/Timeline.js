import {
    Datepicker,
    Eventcalendar,
    Input,
    Popup,
    setOptions,
  } from '@mobiscroll/react';
  import { useCallback, useMemo, useRef, useState,useEffect, useContext } from 'react';
  import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import "./t.css";
import ContextApi from '../ContextAPI/ContextApi';


  setOptions({
    theme: 'ios',
    themeVariant: 'light'
  });
  
  const defaultEvents = [
    {
      start: '2024-10-26T00:00',
      end: '2024-10-31T00:00',
      title: 'Develop Frontend',
      resource: 'charlie',
      progress: 45,
    },
    {
      start: '2024-10-26T00:00',
      end: '2024-10-31T00:00',
      title: 'Develop Backend',
      resource: 'dave',
      progress: 35,
    },
  ];
  

  
  function App() {
    const [myEvents, setMyEvents] = useState(defaultEvents);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [startInput, startInputRef] = useState(null);
    const [endInput, endInputRef] = useState(null);
    const [popupAnchor, setPopupAnchor] = useState(null);
    const [popupEventTitle, setTitle] = useState('');
    const [popupEventDate, setDate] = useState([]);
    const [popupEventProgress, setProgress] = useState(0);
  
    const isDraggingProgress = useRef(false);
    const { user } = useContext(ContextApi); // Get the logged-in user
    const {name,teamId,id} = user


    const [myResources, setMyResources] = useState([]);
  
    // Fetch team members as resources
    const fetchResources = useCallback(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}/members`);
        const data = await response.json();
        if (data.success) {
          setMyResources(data.resources); // Set resources for Mobiscroll
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    }, [teamId]);

  
// Fetch tasks for the timeline
const fetchTasks = useCallback(async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/teams/${teamId}/tasks`);
    const data = await response.json();
    if (data.success) {
      console.log("Fetched Tasks:", data.tasks);
      // Map tasks to ensure they have the required fields for Mobiscroll
      const formattedTasks = data.tasks.map(task => ({
        id: task._id,
        start: task.start,
        end: task.end,
        title: task.title,
        resource: task.resource.map(r => r._id),  // Assuming multiple resources
        progress: task.progress || 0,
        color: task.color,
      }));
      setMyEvents(formattedTasks);
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}, [teamId]);

  
    useEffect(() => {
      fetchResources();
      fetchTasks();
    }, [fetchResources, fetchTasks]);

  
    const myView = useMemo(() => ({ timeline: { type: 'year', eventList: true } }), []);
  
    const loadPopupForm = useCallback((event) => {
      setTitle(event.title);
      setDate([event.start, event.end]);
      setProgress(event.progress || 0);
    }, []);
  

  
  
    const popupHeaderText = useMemo(() => ('Task Detail'), [isEdit]);

  
    const popupResponsive = useMemo(
      () => ({
        medium: {
          display: 'anchored',
          width: 400,
          fullScreen: false,
          touchUi: false,
        },
      }),
      [],
    );
  
    const datepickerResponsive = useMemo(
      () => ({
        medium: {
          touchUi: false,
        },
      }),
      [],
    );
  

    const handleEventClick = useCallback(
      (args) => {
        if (isDraggingProgress.current) {
          return;
        }
        loadPopupForm(args.event);
        setPopupAnchor(args.domEvent.target);
        setPopupOpen(true);
      },
      [loadPopupForm, isDraggingProgress],
    );
  

  
    const handlePopupClose = useCallback(() => {
      if (!isEdit) {
        // Refresh the list, if add popup was canceled, to remove the temporary event
        setMyEvents([...myEvents]);
      }
      setPopupOpen(false);
    }, [isEdit, myEvents]);
  
  

    const renderCustomEvent = useCallback(
      (event) => (
        <div className="mds-progress-event" style={{ background: event.color }}>
          <div className="mds-progress-bar" style={{ width: `${event.original.progress || 0}%` }}>
            <div className="mds-progress-arrow" data-event-id={event.original.id}></div>
          </div>
          <div className="mds-progress-event-content">
            <div className="mds-progress-event-title">{event.original.title}</div>
          </div>
          <div className="mds-progress-label" key={event.original.progress || 0}>
            {event.original.progress || 0}%
          </div>
        </div>
      ),
      [],
    );
  
    const renderCustomResource = useCallback(
      (resource) => (
        <div>
          <div className="mds-progress-employee-name">{resource.name}</div>
          {resource.title && <div className="mds-progress-employee-title">{resource.title}</div>}
        </div>
      ),
      [],
    );
  
    return (
      <div style={{marginBottom:'100px', marginTop:'20px'}}>
        <Eventcalendar
          class="mds-progress-calendar custom-calendar"
          view={myView}
          data={myEvents}
          resources={myResources}
          resourceField="resources" // Refers to array in event schema
          clickToCreate={false}
          dragToCreate={false}
          dragToMove={false}
          dragToResize={false}
          onEventClick={handleEventClick}
          renderResource={renderCustomResource}
          renderScheduleEvent={renderCustomEvent}
        />
        <Popup
          display="bottom"
          fullScreen={true}
          contentPadding={false}
          headerText={popupHeaderText}
          anchor={popupAnchor}
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          responsive={popupResponsive}
        >
          <div className="mbsc-form-group">
            <Input label="Title" value={popupEventTitle} />
            {/* <p><strong>Description:</strong> {selectedEvent.description}</p> */}

          </div>
          <div className="mbsc-form-group">
            <Input ref={startInputRef} label="Starts" />
            <Input ref={endInputRef} label="Ends" />
            <Datepicker
              select="range"
              touchUi={true}
              startInput={startInput}
              endInput={endInput}
              showRangeLabels={false}
              responsive={datepickerResponsive}
              value={popupEventDate}
            />
          </div>
          <div className="mbsc-form-group">
            <label className="mbsc-flex mbsc-align-items-center mbsc-padding">
              <span>Progress</span>
              <input
                className="mds-popup-progress-slider mbsc-flex-1-0"
                type="range"
                min="0"
                max="100"
                value={popupEventProgress}
              />
              <span className="mds-popup-progress-label">{popupEventProgress}%</span>
            </label>
          </div>
        </Popup>
      </div>
    );
  }
  
  export default App;