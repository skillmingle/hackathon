import {
  Datepicker,
  Eventcalendar,
  Input,
  Popup,
  Textarea,
  setOptions,
} from '@mobiscroll/react';
import { useCallback, useMemo, useRef, useState, useEffect, useContext } from 'react';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import "./t.css";
import ContextApi from '../ContextAPI/ContextApi';

setOptions({
  theme: 'ios',
  themeVariant: 'light'
});

function App() {
  const [myEvents, setMyEvents] = useState([]);
  const [tempEvent, setTempEvent] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [startInput, startInputRef] = useState(null);
  const [endInput, endInputRef] = useState(null);
  const [popupAnchor, setPopupAnchor] = useState(null);
  const [popupEventTitle, setTitle] = useState('');
  const [popupEventDate, setDate] = useState([]);
  const [popupEventResource, setResource] = useState('');
  const [popupEventProgress, setProgress] = useState(0);
  const [popupEventDescription, setDescription] = useState('');  // New state for description

  const { user } = useContext(ContextApi); // Get the logged-in user
  const { name, teamId, id } = user;

  // Fetch events for the timeline
  const fetchEvents = useCallback(async () => {
      try {
          const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}/timelines`);
          const data = await response.json();
          if (data.success) {
              setMyEvents(data.timelines);
          }
      } catch (error) {
          console.error("Error fetching events:", error);
      }
  }, [teamId]);

  useEffect(() => {
      fetchEvents();
  }, [fetchEvents]);

  const myView = useMemo(() => ({ timeline: { type: 'month', eventList: true } }), []);

  const loadPopupForm = useCallback((event) => {
      setTitle(event.title);
      setDate([event.start, event.end]);
      setResource(event.resource);
      setProgress(event.progress || 0);
      setDescription(event.description || '');  // Load description
  }, []);

  const updateEvent = useCallback(
      (updatedEvent) => {
          const index = myEvents.findIndex((event) => event.id === updatedEvent.id);
          const newEventList = [...myEvents];
          newEventList.splice(index, 1, updatedEvent);
          setMyEvents(newEventList);
      },
      [myEvents],
  );

  const saveEvent = useCallback(async () => {
      const event = {
          title: popupEventTitle,
          start: popupEventDate[0],
          end: popupEventDate[1],
          resource: popupEventResource,
          progress: popupEventProgress,
          description: popupEventDescription,
          id:id,
          name:name,
          teamId:teamId  // Include description
      };

      try {
          if (isEdit) {
              await fetch(`https://h2h-backend-7ots.onrender.com/api/timelines/${tempEvent._id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(event),
              });
              setMyEvents((events) => events.map((evt) => (evt._id === tempEvent._id ? { ...evt, ...event } : evt)));
          } else {
              const response = await fetch(`https://h2h-backend-7ots.onrender.com/api/teams/${teamId}/timelines`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(event),
              });
              const data = await response.json();
              if (data.success) {
                  setMyEvents((events) => [...events, data.timeline]);
              }
          }
          setPopupOpen(false);
      } catch (error) {
          console.error("Error saving event:", error);
      }
  }, [isEdit, popupEventDate, popupEventProgress, popupEventResource, popupEventTitle, popupEventDescription, tempEvent, teamId]);

  const handleEventCreated = useCallback(
      (args) => {
          setEdit(false);
          setTempEvent(args.event);
          loadPopupForm(args.event);
          setPopupAnchor(args.target);
          setPopupOpen(true);
      },
      [loadPopupForm],
  );

  const handleEventClick = useCallback(
      (args) => {
          setEdit(true);
          setTempEvent({ ...args.event });
          loadPopupForm(args.event);
          setPopupAnchor(args.domEvent.target);
          setPopupOpen(true);
      },
      [loadPopupForm],
  );

  const handleTitleChange = useCallback((ev) => {
      setTitle(ev.target.value);
  }, []);

  const handleDateChange = useCallback((args) => {
      setDate(args.value);
  }, []);

  const handleProgressChange = useCallback((ev) => {
      setProgress(ev.target.value);
  }, []);

  const handleDescriptionChange = useCallback((ev) => {  // New handler for description
      setDescription(ev.target.value);
  }, []);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };


  
  const renderCustomEvent = useCallback(
      (event) => {
          const backgroundColor = getRandomColor(); // Generate random color for each event
          return (
              <div className="mds-progress-event" style={{ background: backgroundColor }}>
                  <div className="mds-progress-bar" style={{ width: `${event.original.progress || 0}%` }}>
                      <div className="mds-progress-arrow" data-event-id={event.original.id}></div>
                  </div>
                  <div className="mds-progress-event-content">
                      <div className="mds-progress-event-title">{event.original.title}</div>
                      {/* <div style={{color:'white'}} className="mds-progress-event-description">{event.original.description}</div> Display description */}
                  <div
                    className="mds-progress-event-description"
                    style={{
                        color: 'white',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        marginLeft:'10px'
                    }}
                >
                    {event.original.description}{"..."}
                </div>
                  </div>
                  <div className="mds-progress-label" key={event.original.progress || 0}>
                      {event.original.progress || 0}%
                  </div>
              </div>
          );
      },
      []
  );

  return (
      <div style={{ marginBottom: '100px' }}>
          <Eventcalendar
              class="mds-progress-calendar custom-calendar"
              view={myView}
              data={myEvents}
              clickToCreate={true}
              dragToCreate={false}
              dragToMove={false}
              dragToResize={false}
              onEventClick={handleEventClick}
              onEventCreated={handleEventCreated}
              renderScheduleEvent={renderCustomEvent}
          />
          <Popup
              display="bottom"
              fullScreen={true}
              contentPadding={false}
              headerText={isEdit ? 'Edit Event' : 'New Event'}
              anchor={popupAnchor}
              buttons={[
                  'cancel',
                  {
                      handler: saveEvent,
                      keyCode: 'enter',
                      text: isEdit ? 'Save' : 'Add',
                      cssClass: 'mbsc-popup-button-primary',
                  },
              ]}
              isOpen={isPopupOpen}
              onClose={() => setPopupOpen(false)}
              responsive={{
                  medium: {
                      display: 'anchored',
                      width: 400,
                      fullScreen: false,
                      touchUi: false,
                  },
              }}
          >
              <div className="mbsc-form-group">
                  <Input label="Title" value={popupEventTitle} onChange={handleTitleChange} />
              </div>
              <div className="mbsc-form-group">
                  <Textarea
                  label='Description'
                      value={popupEventDescription}
                      onChange={handleDescriptionChange}
                      rows="3" // Set rows as needed
                  />
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
                      responsive={{
                          medium: {
                              touchUi: false,
                          },
                      }}
                      onChange={handleDateChange}
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
                          onChange={handleProgressChange}
                      />
                      <span className="mds-popup-progress-label">{popupEventProgress}%</span>
                  </label>
              </div>
          </Popup>
      </div>
  );
}

export default App;
