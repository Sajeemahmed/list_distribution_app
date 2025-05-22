import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password strength validation (at least 8 characters)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role: 'client' // Specify client role for this registration
      });
      
      if (res.data.success) {
        // Don't store token or user info in localStorage since we're redirecting to login
        toast.success('Registration successful! Please log in with your new account.');
        
        // Redirect to login page
        navigate('/login');
      }
    } catch (err) {
      setError(
        err.response && err.response.data.error
          ? err.response.data.error
          : 'Registration failed. Please try again.'
      );
      
      if (err.response && err.response.data.error === 'Email already registered') {
        toast.error('This email is already registered. Please use a different email or login instead.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Inline styles
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    },
    form: {
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: 'none'
    },
    heading: {
      color: '#495057',
      marginBottom: '20px',
      textAlign: 'center'
    },
    label: {
      fontWeight: '500'
    },
    button: {
      backgroundColor: '#0d6efd',
      borderColor: '#0d6efd',
      padding: '10px 0',
      fontWeight: '500',
      width: '100%',
      marginTop: '15px'
    },
    alert: {
      marginBottom: '20px'
    },
    link: {
      color: '#0d6efd',
      textDecoration: 'none'
    },
    linkContainer: {
      textAlign: 'center',
      marginTop: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.form}>
        <Card.Body>
          <h2 style={styles.heading}>Create List Distributor Account</h2>
          
          {error && <Alert variant="danger" style={styles.alert}>{error}</Alert>}
          
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={styles.label}>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={styles.label}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={styles.label}>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password (min. 8 characters)"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={styles.label}>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            <div style={styles.linkContainer}>
              Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SignUp;