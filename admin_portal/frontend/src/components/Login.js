import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = 'http://localhost:5000/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Optionally, check if this email has any schedules
    try {
      const res = await fetch(`${API_BASE}/schedules?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to check schedules');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError('No schedules found for this email.');
        setLoading(false);
        return;
      }
      localStorage.setItem('employeeEmail', email);
      if (onLogin) onLogin(email);
      window.location.href = '/employee';
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ maxWidth: 400, width: '100%', borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)' }}>
        <Card.Body>
          <h2 className="mb-4 text-center">Employee Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>
          </Form>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;