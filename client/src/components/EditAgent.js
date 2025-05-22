import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';

const EditAgent = ({ onLogout }) => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });

  useEffect(() => {
    fetchAgentDetails();
  }, [agentId]);

  const fetchAgentDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/agents/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const agent = response.data.data;
        setFormData({
          name: agent.name,
          email: agent.email,
          mobile: agent.mobile,
          password: '' // Don't prefill password for security
        });
      }
    } catch (err) {
      setError('Failed to fetch agent details. Please try again later.');
      toast.error('Error loading agent details');
      console.error('Error fetching agent details:', err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setError('Name, email, and mobile are required fields.');
      setIsSaving(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsSaving(false);
      return;
    }

    // Mobile validation (basic)
    const mobileRegex = /^[0-9+\-\s()]+$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError('Please enter a valid mobile number.');
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create update payload - only include password if it's provided
      const updatePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim()
      };

      // Only include password if user entered one
      if (formData.password.trim()) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsSaving(false);
          return;
        }
        updatePayload.password = formData.password;
      }

      const response = await axios.put(`/api/agents/${agentId}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Agent updated successfully!');
        navigate('/agents');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update agent. Please try again.');
      }
      toast.error('Error updating agent');
      console.error('Error updating agent:', err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        onLogout();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="content-container">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/agents')}
                className="me-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back to Agents
              </Button>
              <h2 className="d-inline">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Edit Agent
              </h2>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Agent Information</h5>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter agent name"
                          required
                        />
                      </Form.Group>
                    </div>
                    
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email address"
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Mobile *</Form.Label>
                        <Form.Control
                          type="text"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          placeholder="Enter mobile number"
                          required
                        />
                      </Form.Group>
                    </div>
                    
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter new password (leave blank to keep current)"
                        />
                        <Form.Text className="text-muted">
                          Leave blank to keep current password. Minimum 6 characters if changing.
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate('/agents')}
                      className="me-2"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </div>
  );
};

export default EditAgent;