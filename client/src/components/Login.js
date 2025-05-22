import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!email || !password) {
      setError('Please provide both email and password');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
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
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data.success) {
        // Store token and user info in localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        toast.success(`Welcome back, ${res.data.user.name}!`);
        
        // Pass the user data to the parent component
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', err);
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
      maxWidth: '450px',
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
          <h2 style={styles.heading}>List Distributor Login</h2>
          
          {error && <Alert variant="danger" style={styles.alert}>{error}</Alert>}
          
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={styles.label}>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                name="email"
                value={email}
                onChange={onChange}
                required
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={styles.label}>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={onChange}
                required
                disabled={isLoading}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div style={styles.linkContainer}>
              Don't have an account? <Link to="/signup" style={styles.link}>Register here</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;