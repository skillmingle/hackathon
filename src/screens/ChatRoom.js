
import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { MessageBox, ChatList, Input } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

const ChatRoom = ({ teamId, user }) => {

  console.log(user.id)
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Fetch messages for the team
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/${teamId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
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
      const response = await axios.post("http://localhost:5000/api/chat", newMessage);
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setMessageText("");
        setFile(null);
        setReplyTo(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 15000); // 15 seconds
    
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);
  
  
  
  
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
      {!isMobile && <h3>Team Chat</h3>}
      <div style={isMobile? {margin: "auto", height:'70vh',overflowY: "scroll", marginBottom: 10}:{ height: 400, overflowY: "scroll", marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg._id}>
            <MessageBox
              key={msg._id}
              position={msg.senderName === user.name ? "right" : "left"}              
              type={msg.type}
              text={msg.text}
              title={msg.senderName}
              date={new Date(msg.createdAt)}
              // onClick={() => setReplyTo(msg)}
              // replyButton
              // removeButton
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
