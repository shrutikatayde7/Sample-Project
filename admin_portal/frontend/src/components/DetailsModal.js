import React from 'react';
import { Modal, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';

const DetailsModal = ({ show, onHide, detailsProgram, detailsLoading, detailsError, weeks, palette, cardStyle }) => (
  <Modal show={show} onHide={onHide} centered size="lg" style={{ borderRadius: 0 }}>
  <Modal.Header closeButton style={{ background: palette.header, color: '#fff', borderRadius: 0, fontWeight: 700, fontSize: '1.6rem' }}>
      <Modal.Title style={{ color: palette.primary, fontWeight: 700 }}>
        Details for Program #{detailsProgram?.id}
      </Modal.Title>
    </Modal.Header>
  <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: palette.card, borderRadius: 0 }}>
      {detailsLoading && <Spinner animation="border" />}
      {detailsError && <Alert variant="danger">{detailsError}</Alert>}
      {!detailsLoading && !detailsError && weeks.length === 0 && (
        <Alert variant="info">No weeks yet.</Alert>
      )}
      {!detailsLoading && !detailsError && weeks.length > 0 && (
        <Row>
          {weeks.sort((a, b) => a.week_number - b.week_number).map(w => (
            <Col md={6} key={w.id} className="mb-3">
              <Card className="shadow-sm" style={{ ...cardStyle, borderRadius: 0 }}>
                <Card.Header style={{ background: palette.accent, color: palette.primary, fontWeight: 700 }}>
                  <strong>Week {w.week_number}</strong>
                </Card.Header>
                <Card.Body>
                  <ul className="list-group">
                    {(w.modules || []).length === 0 && <li className="list-group-item"><em>No modules yet.</em></li>}
                    {(w.modules || []).map(m => (
                      <li key={m.id} className="list-group-item d-flex align-items-center">
                        <span className="me-2">
                          {typeof m.is_finished === 'boolean' ? (m.is_finished ? '✅' : '⏳') : '•'}
                        </span>
                        <span className="flex-grow-1">{m.title}</span>
                        <a href={m.file_link} target="_blank" rel="noreferrer" className="btn btn-link btn-sm" style={{ color: palette.primary, textDecoration: 'none', fontWeight: 500 }} title="Open file">
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Modal.Body>
  </Modal>
);

export default DetailsModal;
