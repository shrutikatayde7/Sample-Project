import React from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

const SchedulesModal = ({ show, onHide, scheduleForm, handleScheduleFormChange, programOptions, selectedProgramWeeks, addLocalSchedule, submitAllSchedules, scheduleError, localSchedules = [], removeLocalSchedule }) => (
  <Modal show={show} onHide={onHide} centered size="lg" style={{ borderRadius: 0 }}>
  <Modal.Header closeButton style={{ background: '#28a745', color: '#fff', borderRadius: 0, fontWeight: 700, fontSize: '1.6rem' }}>
      <Modal.Title>Add Multiple Schedules</Modal.Title>
    </Modal.Header>
  <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: '#fff', borderRadius: 0, fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' }}>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Employee Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter employee email"
                value={scheduleForm.email}
                onChange={e => handleScheduleFormChange('email', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Program</Form.Label>
              <Form.Select
                value={scheduleForm.program_id}
                onChange={e => handleScheduleFormChange('program_id', e.target.value)}
                disabled={!!scheduleForm.program_id}
              >
                <option value="">Select Program</option>
                {programOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={scheduleForm.start_date}
                onChange={e => handleScheduleFormChange('start_date', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={scheduleForm.end_date}
                onChange={e => handleScheduleFormChange('end_date', e.target.value)}
                disabled={selectedProgramWeeks > 0}
                title={selectedProgramWeeks > 0 ? "End date is auto-calculated based on program weeks" : ""}
              />
              {selectedProgramWeeks > 0 && (
                <Form.Text className="text-muted">
                  End date is auto-calculated for {selectedProgramWeeks} week(s).
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex gap-2 mb-2">
          <Button variant="success" onClick={addLocalSchedule}><i className="bi bi-plus-circle me-2"></i>Add</Button>
          <Button variant="secondary" onClick={onHide}><i className="bi bi-x-circle me-2"></i>Cancel</Button>
          <Button variant="primary" onClick={submitAllSchedules}><i className="bi bi-check-circle me-2"></i>Done</Button>
        </div>
        {scheduleError && <Alert variant="danger">{scheduleError}</Alert>}
        {/* List of added employees - moved inside the form, below buttons */}
        {localSchedules.length > 0 && (
          <div className="mt-3">
            <h5>Added Employees</h5>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Program</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {localSchedules.map((s, idx) => (
                  <tr key={s.temp_id || idx}>
                    <td>{s.email}</td>
                    <td>{programOptions.find(p => p.id === s.program_id)?.title || s.program_id}</td>
                    <td>{s.start_date}</td>
                    <td>{s.end_date}</td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => removeLocalSchedule(s.temp_id || idx)} title="Remove"><i className="bi bi-trash"></i></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Form>
    </Modal.Body>
  </Modal>
);

export default SchedulesModal;
