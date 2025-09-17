import React from 'react';
import { Modal, Button, Card, Form, InputGroup, Alert } from 'react-bootstrap';

const EditProgramModal = ({
  show,
  current,
  weeks,
  moduleDrafts,
  updateModuleDraft,
  addModule,
  addWeek,
  submitting,
  nextWeekNumber,
  resetForm,
  ackMessage,
  palette,
  fontFamily,
  deleteWeek = () => {},
  deleteModule = () => {},
  moveModuleUp = () => {},
  moveModuleDown = () => {}
}) => (
  <Modal show={show && current.id} onHide={resetForm} centered size="lg" style={{ borderRadius: 0 }}>
  <Modal.Header closeButton style={{  color: '#222', borderRadius: 0, fontWeight: 700, fontFamily, fontSize: '1.6rem' }}>
      <Modal.Title>Edit Program</Modal.Title>
    </Modal.Header>
  <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: palette.card, borderRadius: 0, fontFamily: palette.fontFamily || 'Segoe UI, Roboto, Arial, sans-serif' }}>
      <div>
        <p>
          <strong>Program ID:</strong> {current.id} &nbsp;|&nbsp;
          <strong>Title:</strong> {current.title || <em>(untitled)</em>}
        </p>
        <Button variant="success" className="mb-3" onClick={addWeek} disabled={submitting}>
          <i className="bi bi-plus-circle me-2"></i>Add Week {nextWeekNumber}
        </Button>
        {weeks.length === 0 && <Alert variant="info">No weeks yet. Click “Add Week {nextWeekNumber}”.</Alert>}
        {weeks.map(week => (
          <Card key={week.id} className="mb-3 shadow-sm" style={{ background: palette.card, borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(40,167,69,0.06)' }}>
            <Card.Header style={{ background: palette.primary, color: palette.card, fontWeight: 700, fontFamily, borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>Week {week.week_number}</strong></span>
              <Button variant="outline-danger" size="sm" onClick={() => deleteWeek(week.id)} title="Delete Week" style={{ borderRadius: 8, marginLeft: 8 }}>
                <i className="bi bi-trash"></i>
              </Button>
            </Card.Header>
            <Card.Body style={{ background: palette.card, color: palette.text, fontFamily }}>
              <InputGroup className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Module Title"
                  value={moduleDrafts[week.id]?.title || ''}
                  onChange={e => updateModuleDraft(week.id, 'title', e.target.value)}
                  disabled={!week.hasRealId}
                />
                <Form.Control
                  type="text"
                  placeholder="File Link"
                  value={moduleDrafts[week.id]?.file_link || ''}
                  onChange={e => updateModuleDraft(week.id, 'file_link', e.target.value)}
                  disabled={!week.hasRealId}
                />
                <Button
                  variant="success"
                  onClick={() => addModule(week.id)}
                  disabled={submitting || !week.hasRealId}
                >
                  <i className="bi bi-plus-circle"></i>
                </Button>
              </InputGroup>
              <ul className="list-group">
                {(week.modules || []).map((mod, idx) => (
                  <li key={mod.id} className="list-group-item d-flex align-items-center" style={{ background: palette.accent, color: palette.text, fontFamily, border: `1px solid ${palette.border}`, borderRadius: 8 }}>
                    <span className="me-2">
                      {typeof mod.is_finished === 'boolean' ? (mod.is_finished ? '✅' : '⏳') : '•'}
                    </span>
                    <a href={mod.file_link} target="_blank" rel="noreferrer" className="flex-grow-1" style={{ color: palette.primary, textDecoration: 'none', fontWeight: 500 }}>{mod.title}</a>
                    <div className="d-flex gap-1 ms-2">
                      <Button variant="outline-danger" size="sm" onClick={() => deleteModule(week.id, mod.id)} title="Delete Module" style={{ borderRadius: 8 }}>
                        <i className="bi bi-trash"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => moveModuleUp(week.id, idx)} title="Move Up" style={{ borderRadius: 8 }} disabled={idx === 0}>
                        <i className="bi bi-arrow-up"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => moveModuleDown(week.id, idx)} title="Move Down" style={{ borderRadius: 8 }} disabled={idx === (week.modules.length - 1)}>
                        <i className="bi bi-arrow-down"></i>
                      </Button>
                    </div>
                  </li>
                ))}
                {(week.modules || []).length === 0 && <li className="list-group-item" style={{ background: palette.accent, color: palette.text, fontFamily, border: `1px solid ${palette.border}`, borderRadius: 8 }}><em>No modules yet.</em></li>}
              </ul>
            </Card.Body>
          </Card>
        ))}
        <div className="d-flex gap-2 align-items-center mt-3">
          <Button variant="primary" onClick={resetForm}><i className="bi bi-check-circle me-2"></i>Done</Button>
          <Button variant="secondary" onClick={resetForm}><i className="bi bi-x-circle me-2"></i>Cancel</Button>
          {ackMessage && <span className="text-success">{ackMessage}</span>}
        </div>
      </div>
    </Modal.Body>
  </Modal>
);

export default EditProgramModal;
