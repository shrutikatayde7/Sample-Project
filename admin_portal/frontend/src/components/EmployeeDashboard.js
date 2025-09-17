import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = 'http://localhost:5000/api';

  // Use palette and styles similar to admin portal dashboard
  const palette = {
    card: '#fff',
    section: '#e6fff2',
    primary: '#28a745',
    border: '#e0e0e0',
    text: '#222',
    danger: '#dc3545',
  };
  const cardStyle = {
    borderRadius: 16,
    background: palette.card,
    color: palette.text,
    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
    boxShadow: '0 2px 16px rgba(40,167,69,0.08)',
    border: '1px solid #e0e0e0',
  };
  const gradientHeader = {
    background: palette.primary,
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.4rem',
    letterSpacing: 1,
    padding: '18px 24px',
    border: 'none',
    borderRadius: '16px 16px 0 0',
  };

function EmployeeDashboard() {
  const email = localStorage.getItem('employeeEmail');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAgent, setShowAgent] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);

  useEffect(() => {
    if (email) fetchSchedules();
  }, [email]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/login?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to load schedules');
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load schedules');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrResume = (schedule) => {
    window.open(`http://localhost:8501/?schedule_id=${schedule.id}`, '_blank');
    // No need to mark as started locally; always read from backend
  };


  // Dashboard layout (sidebar, header, main content)
  const SIDEBAR_WIDTH = 180;
  const NAVBAR_HEIGHT = 64;
  return (
    <div style={{ minHeight: '100vh', background: palette.background, fontFamily: cardStyle.fontFamily }}>
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: SIDEBAR_WIDTH + 'px', zIndex: 100, background: palette.card, boxShadow: '0 2px 16px 0 rgba(40,167,69,0.08)' }}>
        <Sidebar userType="employee" />
      </div>
      <div style={{ position: 'fixed', top: 0, left: SIDEBAR_WIDTH + 'px', right: 0, height: NAVBAR_HEIGHT + 'px', zIndex: 101, background: palette.card, boxShadow: '0 2px 16px 0 rgba(40,167,69,0.08)' }}>
        <Header />
      </div>
      <div style={{ position: 'relative', left: SIDEBAR_WIDTH + 'px', top: NAVBAR_HEIGHT + 'px', padding: '32px', background: palette.card, minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`, overflowY: 'auto', overflowX: 'hidden', width: `calc(100vw - ${SIDEBAR_WIDTH}px)` }}>
        <main style={{ flex: 1, padding: '32px', background: palette.card }}>
          <Card className="mb-4 shadow-lg" style={cardStyle}>
            <Card.Header className="bg-gradient text-dark" style={{ background: '#fff', color: palette.primary, fontWeight: 700, fontSize: '1.4rem', letterSpacing: 1, padding: '18px 24px', border: 'none', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 2px 8px rgba(40,167,69,0.10)', borderBottom: '1px solid #e0e0e0' }}>
              <div className="d-flex align-items-center justify-content-between">
                <h4 className="mb-0 text-secondary" style={{ fontWeight: 700, color: palette.primary }}>Employee Training Dashboard</h4>
              </div>
            </Card.Header>
            <Card.Body style={{ background: palette.card }}>
              {loading ? (
                <Spinner animation="border" />
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : schedules.length === 0 ? (
                <Alert variant="info">No schedules assigned to this employee.</Alert>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', width: '100%' }}>
                  <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: 0, background: palette.card, fontFamily: cardStyle.fontFamily, color: palette.text, marginBottom: 0 }}>
                    <thead style={{ background: palette.primary, color: '#fff', fontSize: '1.15rem', letterSpacing: 1, position: 'sticky', top: 0, zIndex: 2 }}>
                      <tr>
                        <th style={{ fontWeight: 800, border: 'none' }}>Program</th>
                        <th style={{ fontWeight: 800, border: 'none' }}>Start Date</th>
                        <th style={{ fontWeight: 800, border: 'none' }}>End Date</th>
                        <th style={{ fontWeight: 800, border: 'none' }}>Status</th>
                        <th style={{ fontWeight: 800, border: 'none' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map(s => (
                        <tr key={s.id} style={{ ...cardStyle, background: '#28a745', color: '#1a4d1a' }}>
                          <td>
                            <span
                              style={{ fontWeight: 500, color: '#28a745', cursor: 'pointer' }}
                              onClick={() => handleStartOrResume(s)}
                            >{s.program_title || s.program_id}</span>
                          </td>
                          <td>{s.start_date}</td>
                          <td>{s.end_date}</td>
                          <td>
                            {s.is_finished ? (
                              <Badge bg="success" style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', border: 'none', fontFamily: cardStyle.fontFamily, background: palette.primary, color: '#fff' }}>Completed</Badge>
                            ) : (
                              <Badge bg="warning" style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', border: 'none', fontFamily: cardStyle.fontFamily, background: palette.section, color: palette.primary }}>Pending</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="success"
                              style={{ borderRadius: 24, fontWeight: 600, fontFamily: cardStyle.fontFamily, color: '#fff', background: palette.primary, border: 'none', boxShadow: '0 2px 8px rgba(40,167,69,0.10)' }}
                              onClick={() => handleStartOrResume(s)}
                              disabled={s.is_finished}
                            >
                              {s.is_finished
                                ? 'Completed'
                                : (s.completed_modules === 0 && s.completed_weeks === 0)
                                  ? 'Start'
                                  : 'Resume'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </main>
      </div>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
      />
    </div>
  );
}

export default EmployeeDashboard;