
import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { MessageBox, ChatList, Input } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import { toast, Toaster } from "react-hot-toast";
import GridLoader from "react-spinners/GridLoader";

const ChatRoom = ({ teamId, user }) => {

  //console.log(user.id)
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [spinner, setspinner] = useState(false)

  const [messageSeen, setmessageSeen] = useState(true)



  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Fetch messages for the team
  const fetchMessages = async () => {
    setspinner(true)
    try {
      const response = await axios.get(`https://h2h-backend-7ots.onrender.com/api/chat/${teamId}`);
      if (response.data.success) {
        setspinner(false)
        setMessages(response.data.messages);
      }
    } catch (error) {
      setspinner(false)
      toast.error('Error fetching messages')
      //console.error("Error fetching messages:", error);
    }
  };
  
  // Handle sending a message
  const sendMessage = async () => {
    if (!messageText.trim() && !file) return;
    
    const newMessage = {
      teamId,
      senderId: user.id,
      senderName: user.name,
      text: messageText,
      replyTo: replyTo?._id || null,
      type: file ? (file.type.startsWith("image/") ? "image" : "file") : "text",
      fileUrl: file ? URL.createObjectURL(file) : null,
    };
    
    try {
      const response = await axios.post("https://h2h-backend-7ots.onrender.com/api/chat", newMessage);
      if (response.data.success) {
        (user.id=='6729ecd7e291eab9786439ed'|| user.id=='672a0c8fae10ec7340b1b488')? updateMessageSeen(true):(messageSeen? updateMessageSeen(false):setmessageSeen(false))
        setMessages((prev) => [...prev, response.data.message]);
        setMessageText("");
        setFile(null);
        setReplyTo(null);
      }
    } catch (error) {
      toast.error('Error sending messages')
      //console.error("Error sending message:", error);
    }
  };

  
  // Function to update messageSeen status
  const updateMessageSeen = async (messageSeen) => {
    try {
      await axios.put(`https://h2h-backend-7ots.onrender.com/api/team/${teamId}/message-seen`, { messageSeen });
      setmessageSeen(messageSeen)
    } catch (error) {
      //console.error("Error updating messageSeen:", error);
    }
  };


  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 30000); // 15 seconds
    
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);
  
  

    // Delete a message by ID
    const deleteMessage = async (messageId) => {
      try {
        const response = await axios.delete(
          `https://h2h-backend-7ots.onrender.com/api/chat/${teamId}/message/${messageId}`
        );
        if (response.data.success) {
          toast.success('Message Deleted')
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message._id !== messageId)
          );
        } else {
          toast.error("Failed to delete message");
        }
      } catch (error) {
        //console.error("Error deleting message:", error);
      }
    };


    const handleDelete=(senderId, messageId)=>{
      //console.log(user.id, senderId)
      if(user.id==senderId){
        toast((t) => (
          <span>
            Delete Message?
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  deleteMessage(messageId)
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
      }else{
        toast.error('Only sender can delete')
      }
    }
  
  
  const messagesEndRef = useRef(null);
  
  // Scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(scrollToBottom, [messages]);
  // components/ChatRoom.js
  // Handle file input
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    fetchMessages();
  }, [teamId]);
  
  return (
    <div style={{ padding: 20, margin: "auto" }}>
      <Toaster toastOptions={{ duration: 5000 }} />
      {spinner &&<GridLoader color="#41a9be" />}
      {!isMobile && <h3>Team Chat</h3>}
      <div style={isMobile? {margin: "auto", height:'65vh',overflowY: "scroll", marginBottom: 10}:{ height: 400, overflowY: "scroll", marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg._id}>
            <MessageBox
              key={msg._id}
              position={msg.senderName === user.name ? "right" : "left"}              
              type={msg.type}
              text={msg.text}
              title={msg.senderName}
              date={new Date(msg.createdAt)}
              onClick={() => handleDelete(msg.senderId._id,msg._id)}
              // replyButton
              removeButton
              // reply={msg.replyTo ? `Replying to: ${msg.replyTo.text}` : null}
            />
          </div>
        ))}
      <div ref={messagesEndRef} />
      </div>
      {replyTo && (
        <div style={{ marginBottom: 10 }}>
          <span>Replying to: {replyTo.text}</span>
          <button onClick={() => setReplyTo(null)}>Cancel</button>
        </div>
      )}
      <div style={{border:'1px solid lightblue', borderRadius:'8px'}}>

      <Input
        
        placeholder="Type a message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        rightButtons={
          <>
            {/* <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="fileInput" /> */}
            {/* <button onClick={() => document.getElementById("fileInput").click()}>Attach File</button> */}
            <button
              style={{
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                marginLeft: 10,
              }}
              onClick={sendMessage}
              >
              Send
            </button>
          </>
        }
        />
    </div>
        </div>
  );
};

export default ChatRoom;
