import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Modal, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUserPlus, faList } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';

const AgentList = ({ onLogout }) => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAgentId, setDeleteAgentId] = useState(null);
  const [deleteAgentName, setDeleteAgentName] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAgents(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch agents. Please try again later.');
      toast.error('Error loading agents');
      console.error('Error fetching agents:', err);
      
      // If token expired or unauthorized, redirect to login
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (agentId, agentName) => {
    setDeleteAgentId(agentId);
    setDeleteAgentName(agentName);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteAgentId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/agents/${deleteAgentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Remove agent from state
        setAgents(agents.filter(agent => agent._id !== deleteAgentId));
        toast.success('Agent deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete agent');
      console.error('Error deleting agent:', err);
      
      // If token expired or unauthorized, redirect to login
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        onLogout();
      }
    } finally {
      setShowDeleteModal(false);
      setDeleteAgentId(null);
      setDeleteAgentName('');
    }
  };

  const handleEditClick = (agentId) => {
    navigate(`/agents/edit/${agentId}`);
  };

  const handleViewLists = (agentId) => {
    navigate(`/agent-lists/${agentId}`);
  };

  const handleAddAgent = () => {
    navigate('/agents/add');
  };

  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="content-container">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Agent Management</h2>
            <Button 
              variant="primary" 
              onClick={handleAddAgent}
            >
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              Add New Agent
            </Button>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : agents.length === 0 ? (
            <Alert variant="info">
              No agents found. Create a new agent to get started.
            </Alert>
          ) : (
            <Table hover responsive className="shadow-sm">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent._id}>
                    <td>{agent.name}</td>
                    <td>{agent.email}</td>
                    <td>{agent.mobile}</td>
                    <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleViewLists(agent._id)}
                        title="View assigned lists"
                      >
                        <FontAwesomeIcon icon={faList} className="me-1" />
                        View Lists
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEditClick(agent._id)}
                        title="Edit agent details"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteClick(agent._id, agent.name)}
                        title="Delete agent"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete agent <strong>{deleteAgentName}</strong>?</p>
              <p>This action cannot be undone.</p>
              <Alert variant="warning" className="mt-3">
                <strong>Warning:</strong> Deleting this agent will also remove all their assigned lists.
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete Agent
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default AgentList;