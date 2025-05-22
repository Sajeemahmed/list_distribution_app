import React, { useState, useEffect } from 'react';
import { Container, Accordion, Button, Spinner, Badge, Card, Row, Col, Table, Alert, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faUser, faList, faEdit, faTrash, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';

const ListDistribution = ({ onLogout }) => {
  const navigate = useNavigate();
  const [distributions, setDistributions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all agents
      const agentsRes = await axios.get('/api/agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let agentsData = [];
      if (agentsRes.data.success && agentsRes.data.data) {
        agentsData = agentsRes.data.data;
        setAgents(agentsData);
      }
      
      // Fetch all distributions with populated agent data
      const listsRes = await axios.get('/api/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (listsRes.data.success && listsRes.data.data) {
        setDistributions(listsRes.data.data);
      }
    } catch (err) {
      setError('Failed to fetch distribution data. Please try again later.');
      toast.error('Error loading data');
      console.error('Error fetching data:', err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        onLogout && onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Find the agent by ID from the agents array
  const getAgentName = (agentId) => {
    if (!agentId) return 'No Agent Assigned';
    
    const cleanAgentId = String(agentId)
      .replace(/ObjectId\(['"](.*)['"]\)/, '$1')
      .replace(/['"]/g, '');
    
    const agent = agents.find(agent => {
      const cleanAgent_id = String(agent._id)
        .replace(/ObjectId\(['"](.*)['"]\)/, '$1')
        .replace(/['"]/g, '');
      return cleanAgent_id === cleanAgentId;
    });
    
    return agent ? agent.name : 'Agent Not Found';
  };

  // Group distributions by uploaded filename
  const groupByFileName = () => {
    const groups = {};
    
    distributions.forEach(dist => {
      if (!groups[dist.fileName]) {
        groups[dist.fileName] = [];
      }
      groups[dist.fileName].push(dist);
    });
    
    return groups;
  };

  const handleReassignClick = (list) => {
    setSelectedList(list);
    setSelectedAgentId(list.agent && typeof list.agent === 'object' ? list.agent._id : list.agent);
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
        // Update the local state
        setDistributions(prev => 
          prev.map(dist => 
            dist._id === selectedList._id 
              ? { ...dist, agent: selectedAgentId }
              : dist
          )
        );
        setShowReassignModal(false);
        setSelectedList(null);
        setSelectedAgentId('');
        // Refresh data to get updated agent information
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to reassign list');
      console.error('Error reassigning list:', err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        onLogout && onLogout();
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
          setDistributions(prev => prev.filter(dist => dist._id !== listId));
        }
      } catch (err) {
        toast.error('Failed to delete list');
        console.error('Error deleting list:', err);
        
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          onLogout && onLogout();
        }
      }
    }
  };

  const distributionGroups = groupByFileName();

  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="content-container">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>List Distributions</h2>
            <Button 
              variant="primary" 
              onClick={() => navigate('/lists/upload')}
            >
              <FontAwesomeIcon icon={faFileUpload} className="me-2" />
              Upload New List
            </Button>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : distributions.length === 0 ? (
            <Alert variant="info">
              No lists have been uploaded yet. Upload your first list to get started.
            </Alert>
          ) : (
            <div>
              {Object.entries(distributionGroups).map(([fileName, lists], groupIndex) => (
                <Card className="mb-4 shadow-sm" key={groupIndex}>
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faList} className="me-2" />
                      {fileName}
                      <Badge bg="primary" className="ms-2">
                        {lists.reduce((total, list) => total + list.items.length, 0)} items
                      </Badge>
                    </h5>
                    <small className="text-muted">
                      Distributed across {lists.length} agent{lists.length !== 1 ? 's' : ''} • 
                      Uploaded: {new Date(lists[0].createdAt).toLocaleDateString()}
                    </small>
                  </Card.Header>
                  
                  <Card.Body>
                    <Accordion defaultActiveKey="0">
                      {lists.map((list, index) => {
                        // Use the helper function to find the agent name
                        const agentName = list.agent && list.agent.name 
                          ? list.agent.name  // If agent is populated, use the name directly
                          : getAgentName(list.agent); // Otherwise use our helper function
                        return (
                          <Accordion.Item eventKey={index.toString()} key={list._id}>
                            <Accordion.Header>
                              <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                <div>
                                  <FontAwesomeIcon icon={faUser} className="me-2" />
                                  <strong>{agentName}</strong>
                                  <Badge bg="secondary" className="ms-2">
                                    {list.items.length} item{list.items.length !== 1 ? 's' : ''}
                                  </Badge>
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
                                      <td>{item.firstName}</td>
                                      <td>{item.phone}</td>
                                      <td>{item.notes || 'No notes'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
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
                Reassign list with <strong>{selectedList?.items?.length}</strong> items 
                from <strong>{selectedList ? getAgentName(selectedList.agent) : ''}</strong> to:
              </p>
              <Form.Group>
                <Form.Label>Select New Agent</Form.Label>
                <Form.Select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  <option value="">-- Select Agent --</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
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

export default ListDistribution;