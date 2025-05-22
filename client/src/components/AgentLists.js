import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, Card, Badge, Accordion, Row, Col, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faList, faPhone, faFileText, faUserEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';

const AgentLists = ({ onLogout }) => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const [lists, setLists] = useState([]);
  const [agent, setAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  console.log('AgentLists component loaded with agentId:', agentId);

  useEffect(() => {
    if (agentId) {
      fetchData();
    }
  }, [agentId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No authentication token found');
        onLogout();
        return;
      }

      console.log('Fetching data for agentId:', agentId);
      
      // Fetch agent details and their lists concurrently
      const [agentResponse, listsResponse, agentsResponse] = await Promise.all([
        axios.get(`/api/agents/${agentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/lists/agent/${agentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/agents', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      console.log('Agent response:', agentResponse.data);
      console.log('Lists response:', listsResponse.data);
      console.log('Agents response:', agentsResponse.data);
      
      if (agentResponse.data.success) {
        setAgent(agentResponse.data.data);
      } else {
        setError('Failed to load agent details');
      }
      
      if (listsResponse.data.success) {
        setLists(listsResponse.data.data || []);
      } else {
        setError('Failed to load agent lists');
      }
      
      if (agentsResponse.data.success) {
        setAgents(agentsResponse.data.data || []);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
      toast.error('Error loading data');
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalItems = () => {
    return lists.reduce((total, list) => {
      return total + (list.items ? list.items.length : 0);
    }, 0);
  };

  // Group lists by fileName (like ListDistribution component)
  const groupByFileName = () => {
    const groups = {};
    lists.forEach(list => {
      const fileName = list.fileName || 'Unknown File';
      if (!groups[fileName]) {
        groups[fileName] = [];
      }
      groups[fileName].push(list);
    });
    return groups;
  };

  const handleReassignClick = (list) => {
    setSelectedList(list);
    setSelectedAgentId('');
    setShowReassignModal(true);
  };

  const handleReassignSubmit = async () => {
    if (!selectedList || !selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    setIsReassigning(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/lists/${selectedList._id}/reassign`, {
        agentId: selectedAgentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('List reassigned successfully');
        setShowReassignModal(false);
        setSelectedList(null);
        setSelectedAgentId('');
        // Refresh data
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to reassign list');
      console.error('Error reassigning list:', err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        onLogout();
      }
    } finally {
      setIsReassigning(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`/api/lists/${listId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          toast.success('List deleted successfully');
          setLists(prev => prev.filter(list => list._id !== listId));
        }
      } catch (err) {
        toast.error('Failed to delete list');
        console.error('Error deleting list:', err);
        
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeToken('token');
          onLogout();
        }
      }
    }
  };

  const distributionGroups = groupByFileName();

  if (!agentId) {
    return (
      <div className="app-container">
        <Sidebar onLogout={onLogout} />
        <div className="content-container">
          <Container>
            <Alert variant="danger">Agent ID is missing</Alert>
          </Container>
        </div>
      </div>
    );
  }

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
                {agent ? `${agent.name}'s List Distribution` : 'Agent List Distribution'}
              </h2>
            </div>
          </div>

          {agent && (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <strong>Name:</strong> {agent.name}
                  </Col>
                  <Col md={4}>
                    <strong>Email:</strong> {agent.email || 'N/A'}
                  </Col>
                  <Col md={4}>
                    <strong>Mobile:</strong> {agent.mobile || 'N/A'}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md={4}>
                    <strong>Total Lists:</strong> 
                    <Badge bg="primary" className="ms-2">{lists.length}</Badge>
                  </Col>
                  <Col md={4}>
                    <strong>Total Items:</strong> 
                    <Badge bg="success" className="ms-2">{getTotalItems()}</Badge>
                  </Col>
                  <Col md={4}>
                    <strong>Member Since:</strong> {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : lists.length === 0 ? (
            <Alert variant="info">
              No lists have been assigned to this agent yet.
            </Alert>
          ) : (
            <div>
              {Object.entries(distributionGroups).map(([fileName, agentLists], groupIndex) => (
                <Card className="mb-4 shadow-sm" key={groupIndex}>
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-0">
                          <FontAwesomeIcon icon={faList} className="me-2" />
                          {fileName}
                          <Badge bg="primary" className="ms-2">
                            {agentLists.reduce((total, list) => total + (list.items ? list.items.length : 0), 0)} items
                          </Badge>
                        </h5>
                        <small className="text-muted">
                          Uploaded: {agentLists[0] && agentLists[0].createdAt ? new Date(agentLists[0].createdAt).toLocaleDateString() : 'Unknown'} • 
                          {agentLists.length} list{agentLists.length !== 1 ? 's' : ''} assigned to {agent?.name || 'this agent'}
                        </small>
                      </div>
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    <Accordion defaultActiveKey="0">
                      {agentLists.map((list, index) => (
                        <Accordion.Item eventKey={index.toString()} key={list._id || index}>
                          <Accordion.Header>
                            <div className="d-flex justify-content-between align-items-center w-100 me-3">
                              <div>
                                <FontAwesomeIcon icon={faFileText} className="me-2" />
                                <strong>List #{index + 1}</strong>
                                <Badge bg="secondary" className="ms-2">
                                  {list.items ? list.items.length : 0} item{(list.items && list.items.length !== 1) ? 's' : ''}
                                </Badge>
                                <small className="text-muted ms-2">
                                  (Created: {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : 'Unknown'})
                                </small>
                              </div>
                              <div>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReassignClick(list);
                                  }}
                                  title="Reassign to different agent"
                                >
                                  <FontAwesomeIcon icon={faUserEdit} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteList(list._id);
                                  }}
                                  title="Delete this list"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </div>
                            </div>
                          </Accordion.Header>
                          
                          <Accordion.Body>
                            <div className="mb-2">
                              <small className="text-muted">
                                <strong>List ID:</strong> {list._id || 'Unknown'} | 
                                <strong> Assigned to:</strong> {agent?.name || 'Unknown Agent'}
                              </small>
                            </div>
                            {list.items && list.items.length > 0 ? (
                              <Table striped bordered hover responsive size="sm">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>First Name</th>
                                    <th>Phone</th>
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {list.items.map((item, itemIndex) => (
                                    <tr key={itemIndex}>
                                      <td>{itemIndex + 1}</td>
                                      <td>{item.firstName || 'N/A'}</td>
                                      <td>
                                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                                        {item.phone || 'N/A'}
                                      </td>
                                      <td>{item.notes || 'No notes'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <Alert variant="info">No items in this list</Alert>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* Reassign Modal */}
          <Modal show={showReassignModal} onHide={() => setShowReassignModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Reassign List</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Reassign list with <strong>{selectedList?.items?.length || 0}</strong> items 
                from <strong>{agent?.name || 'this agent'}</strong> to:
              </p>
              <Form.Group>
                <Form.Label>Select New Agent</Form.Label>
                <Form.Select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  <option value="">-- Select Agent --</option>
                  {agents
                    .filter(a => a._id !== agentId) // Don't show current agent in dropdown
                    .map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email})
                      </option>
                    ))
                  }
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => setShowReassignModal(false)}
                disabled={isReassigning}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleReassignSubmit}
                disabled={isReassigning || !selectedAgentId}
              >
                {isReassigning ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-2"
                    />
                    Reassigning...
                  </>
                ) : (
                  'Reassign'
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default AgentLists;