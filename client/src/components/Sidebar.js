import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faUserPlus, 
  faFileUpload, 
  faListUl, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>List Distributor</h3>
        <p className="text-muted mb-0">Welcome, {user.email}</p>
      </div>

      <Nav className="flex-column">
        <Nav.Item>
          <NavLink to="/dashboard" className="nav-link">
            <FontAwesomeIcon icon={faHome} className="me-2" /> Dashboard
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/agents" className="nav-link">
            <FontAwesomeIcon icon={faUsers} className="me-2" /> View Agents
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/agents/add" className="nav-link">
            <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Add Agent
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/lists/upload" className="nav-link">
            <FontAwesomeIcon icon={faFileUpload} className="me-2" /> Upload List
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/lists" className="nav-link">
            <FontAwesomeIcon icon={faListUl} className="me-2" /> View Distributions
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link onClick={onLogout} className="mt-5 text-danger">
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;