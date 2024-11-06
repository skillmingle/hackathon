// Files.js
import React, { useState, useEffect, useCallback,useContext } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { FaFilePdf, FaImage, FaFileAlt, FaDownload, FaEye, FaTrash } from 'react-icons/fa';
import { Button } from 'rsuite';
import ContextApi from '../ContextAPI/ContextApi';
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import GridLoader from "react-spinners/GridLoader";

import '../css/Files.css';
import leftIcon from "../images/h2h logo.jpg"; // Replace with your left icon image path

const CLIENT_ID = '339348172585-mucddr9ktvagcqamk6khtl1oliradje1.apps.googleusercontent.com';
const FOLDER_ID = '1Ov-3DVzoXkA6Ue6NtC9AnA5zR5dpJMRT';

function DriveUploader() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [spinner, setspinner] = useState(false)

  const { user } = useContext(ContextApi); // Get the logged-in user
    const {name,teamId,id} = user


    // Function to fetch the accessToken
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get("https://h2h-backend-7ots.onrender.com/api/admin/accessToken");
        if (response.data.success) {
          setAccessToken(response.data.accessToken);
        } else {
          alert("Failed to fetch access token.");
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
        toast.error("An error occurred while fetching the access token.");
      }
    };
  
    useEffect(() => {
      fetchAccessToken();
    }, []);

  const fetchFiles = useCallback(async () => {
    if (!accessToken) return;
    setspinner(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&fields=files(id,name,mimeType,modifiedTime,thumbnailLink,webViewLink,webContentLink)&key=${CLIENT_ID}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setspinner(false)
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files.');
    }
  }, [accessToken]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle file deletion
  const handleDelete = async (fileId, filename) => {
    if (!accessToken) return;
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        
        // Log deletion activity
        await fetch(`https://h2h-backend-7ots.onrender.com/api/activity-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId: teamId,
            userId: id,
            userName: name,
            action: 'DELETE',
            description: `Deleted file with name: ${filename}`,
          }),
        });
        toast.success('File deleted successfully!');
      } else {
        toast.error('Failed to delete file.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('An error occurred while deleting the file.');
    }
  };



  const confirmDelete = (fileId,filename) => {
    toast((t) => (
      <span>
        Are you sure you want to delete this file?
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              handleDelete(fileId,filename);
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
  };



  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !accessToken) {
      alert("Please select a file and ensure you're authenticated.");
      return;
    }

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [FOLDER_ID],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    try {
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        body: form,
      });
      if (response.ok) {
        
        // Log upload activity
        const data = await response.json();
        await fetch(`https://h2h-backend-7ots.onrender.com/api/activity-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId: teamId,
            userId: id,
            userName: name,
            action: 'UPLOAD',
            description: `Uploaded file with name: ${file.name}`,
          }),
        });
        toast.success('File uploaded successfully!');
        setFile(null);
        fetchFiles();
      } else {
        toast.error('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred during file upload.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Toaster toastOptions={{ duration: 4000 }} />
      {!accessToken ? (
        <div></div>
      ) : (
        <div className='text-center' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <div className="upload-container text-center" style={{ marginBottom: '20px' }}>
            <h3 className="upload-title">Upload Your Files</h3>
            <input className="custom-uploader" type="file" onChange={handleFileChange} />
            <Button style={{ border: '1px solid grey', marginLeft: '10px' }} onClick={handleUpload}>Upload File</Button>
          </div>

          <div className="file-gallery">
            <h2 className="gallery-title">My Files</h2>
            {spinner &&<GridLoader color="#41a9be" />}
            <div className="file-list">
              {files.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-thumbnail">
                    <img src={file.thumbnailLink} referrerPolicy="no-referrer" alt={file.name} />
                    <div className="file-type-icon">
                      {file.mimeType.includes('image') && <FaImage />}
                      {file.mimeType.includes('pdf') && <FaFilePdf />}
                      {!file.mimeType.includes('image') && !file.mimeType.includes('pdf') && <FaFileAlt />}
                    </div>
                  </div>
                  <div className="file-info">
                    <h3 className="file-name">{file.name}</h3>
                    <p className="file-modified">Last Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
                    <div className="file-actions">
                      <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="view-button">
                        <FaEye /> View
                      </a>
                      <a href={file.webContentLink} target="_blank" rel="noopener noreferrer" download className="download-button">
                        <FaDownload /> Download
                      </a>
                      <button onClick={() => confirmDelete(file.id,file.name)} className="delete-button" style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>
                        <FaTrash /> 
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <DriveUploader />
    </GoogleOAuthProvider>
  );
}
