import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';

const UploadList = ({ onLogout }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Choose a file...');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    // Check if there are agents available for distribution
    const checkAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/agents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setAgentCount(response.data.count);
          if (response.data.count === 0) {
            setError('No agents are available. Please add agents first before uploading a list.');
          }
        }
      } catch (err) {
        console.error('Error checking agents:', err);
      }
    };

    checkAgents();
  }, []);

  const onChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const validateFile = () => {
    if (!file) {
      setError('Please select a file to upload');
      return false;
    }

    // Check file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExt)) {
      setError('Only CSV, XLSX, and XLS files are allowed');
      return false;
    }

    // Check file size (max 1MB)
    if (file.size > 1000000) {
      setError('File size cannot exceed 1MB');
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (agentCount === 0) {
      toast.error('No agents available. Please add agents first.');
      return;
    }
    
    if (!validateFile()) return;
    
    setIsLoading(true);
    setError('');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('List uploaded and distributed successfully!');
        navigate('/lists');
      }
    } catch (err) {
      const errorMsg = err.response && err.response.data.error
        ? err.response.data.error
        : 'Failed to upload file. Please try again.';
      
      setError(errorMsg);
      toast.error('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="content-container">
        <Container>
          <h2 className="header-title">Upload and Distribute List</h2>
          
          <Card className="form-container">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={onSubmit}>
                <div className="text-center mb-4">
                  <FontAwesomeIcon icon={faFileAlt} size="4x" className="text-primary mb-3" />
                  <h4>Upload CSV File</h4>
                  <p className="text-muted">
                    Upload a CSV, XLSX, or XLS file to distribute among agents.
                    <br />
                    The file should contain FirstName, Phone, and Notes columns.
                  </p>
                </div>
                
                <Form.Group controlId="formFile" className="mb-4">
                  <div className="custom-file">
                    <Form.Control
                      type="file"
                      className="custom-file-input"
                      id="customFile"
                      onChange={onChange}
                      disabled={isLoading || agentCount === 0}
                    />
                    <Form.Label className="custom-file-label">
                      {fileName}
                    </Form.Label>
                  </div>
                  <Form.Text className="text-muted">
                    File size should not exceed 1MB
                  </Form.Text>
                </Form.Group>
                
                {agentCount > 0 && (
                  <div className="text-muted mb-3">
                    The list will be distributed among {agentCount} agent{agentCount !== 1 ? 's' : ''}.
                  </div>
                )}
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/lists')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isLoading || !file || agentCount === 0}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        Upload and Distribute
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default UploadList;