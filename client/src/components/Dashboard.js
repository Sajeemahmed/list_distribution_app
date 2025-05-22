import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faList, faClipboardList, faEdit, faEye, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    agentCount: 0,
    listCount: 0,
    itemCount: 0
  });
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchAgents();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Get agent count
      const agentsRes = await axios.get('/api/agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get lists data
      const listsRes = await axios.get('/api/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate total items across all lists
      let totalItems = 0;
      if (listsRes.data.data) {
        listsRes.data.data.forEach(list => {
          totalItems += list.items.length;
        });
      }
      
      setStats({
        agentCount: agentsRes.data.count || 0,
        listCount: listsRes.data.count || 0,
        itemCount: totalItems
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Only show first 5 agents on dashboard
        setAgents(response.data.data.slice(0, 5));
      }
    } catch (err) {
      setError('Failed to fetch agents.');
      console.error('Error fetching agents:', err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
      }
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleViewLists = (agentId) => {
    navigate(`/agent-lists/${agentId}`);
  };

  const handleEditAgent = (agentId) => {
    navigate(`/agents/edit/${agentId}`);
  };

  const handleViewAllAgents = () => {
    navigate('/agents');
  };

  const handleAddAgent = () => {
    navigate('/agents/add');
  };

  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="content-container">
        <Container>
          <h2 className="mb-4">Dashboard</h2>
          
          {/* Stats Cards */}
          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading dashboard data...</p>
            </div>
          ) : (
            <Row className="mb-5">
              <Col md={4} className="mb-4">
                <Card className="stats-card text-center h-100 shadow-sm">
                  <Card.Body>
                    <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3 text-primary" />
                    <Card.Title>Total Agents</Card.Title>
                    <h2 className="text-primary">{stats.agentCount}</h2>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-4">
                <Card className="stats-card text-center h-100 shadow-sm">
                  <Card.Body>
                    <FontAwesomeIcon icon={faList} size="3x" className="mb-3 text-success" />
                    <Card.Title>Distributed Lists</Card.Title>
                    <h2 className="text-success">{stats.listCount}</h2>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-4">
                <Card className="stats-card text-center h-100 shadow-sm">
                  <Card.Body>
                    <FontAwesomeIcon icon={faClipboardList} size="3x" className="mb-3 text-warning" />
                    <Card.Title>Total Items</Card.Title>
                    <h2 className="text-warning">{stats.itemCount}</h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Recent Agents Section */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Recent Agents
              </h5>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleAddAgent}
                  className="me-2"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                  Add Agent
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleViewAllAgents}
                >
                  View All Agents
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {isLoadingAgents ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading agents...</span>
                </div>
              ) : agents.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  No agents found. <Button variant="link" onClick={handleAddAgent} className="p-0">Create your first agent</Button> to get started.
                </Alert>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map(agent => (
                      <tr key={agent._id}>
                        <td>
                          <strong>{agent.name}</strong>
                        </td>
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
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEditAgent(agent._id)}
                            title="Edit agent"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              
              {agents.length > 0 && (
                <div className="text-center mt-3">
                  <Button variant="outline-secondary" onClick={handleViewAllAgents}>
                    View All {stats.agentCount} Agents
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Dashboard;