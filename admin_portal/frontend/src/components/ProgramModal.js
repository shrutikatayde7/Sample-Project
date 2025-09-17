import React from 'react';
import { Modal, Button, Form, Card, InputGroup, Alert } from 'react-bootstrap';

const ProgramModal = ({ show, onHide, current, setCurrent, weeks = [], moduleDrafts = {}, updateModuleDraft = () => {}, addModule = () => {}, addWeek = () => {}, submitting, startBuilding, resetForm, palette, gradientHeader, nextWeekNumber = 1, ackMessage }) => {
  const [step, setStep] = React.useState(1);
  React.useEffect(() => {
    if (!show) setStep(1);
  }, [show]);

  const handleCreateAndNext = async () => {
    const success = await startBuilding();
    if (success) {
      setStep(2);
    }
    // If not successful, stay on step 1
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" style={{ borderRadius: 0 }}>
      <Modal.Header closeButton style={{ borderRadius: 0 }}>
        <Modal.Title style={{ color: palette.primary, fontWeight: 700 }}>Create Program</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: palette.card, borderRadius: 0, fontFamily: palette.fontFamily || 'Segoe UI, Roboto, Arial, sans-serif' }}>
        {step === 1 && (
          <Form.Group className="mb-3">
            <Form.Label style={{ color: palette.text, fontWeight: 600 }}>Program Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter program title"
              value={current.title}
              onChange={e => setCurrent(prev => ({ ...prev, title: e.target.value }))}
              style={{ borderRadius: 8, border: `1px solid ${palette.border}` }}
            />
          </Form.Group>
        )}
        {step === 2 && (
          <div>
            <Button variant="info" className="mb-3" onClick={addWeek} disabled={submitting}>
              <i className="bi bi-plus-circle me-2"></i>Add Week {nextWeekNumber}
            </Button>
            {weeks.length === 0 && <Alert variant="info">No weeks yet. Click “Add Week {nextWeekNumber}”.</Alert>}
            {weeks.map(week => (
              <Card key={week.id} className="mb-3 shadow-sm" style={{ background: palette.card, borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(40,167,69,0.06)' }}>
                <Card.Header style={{ background: palette.primary, color: palette.card, fontWeight: 700, fontFamily: 'inherit', borderRadius: '16px 16px 0 0' }}>
                  <strong>Week {week.week_number}</strong>
                </Card.Header>
                <Card.Body style={{ background: palette.card, color: palette.text }}>
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
                    {(week.modules || []).map(mod => (
                      <li key={mod.id} className="list-group-item d-flex align-items-center" style={{ background: palette.accent, color: palette.text, fontFamily: 'inherit', border: `1px solid ${palette.border}`, borderRadius: 8 }}>
                        <span className="me-2">
                          {typeof mod.is_finished === 'boolean' ? (mod.is_finished ? '✅' : '⏳') : '•'}
                        </span>
                        <a href={mod.file_link} target="_blank" rel="noreferrer" className="flex-grow-1" style={{ color: palette.primary, textDecoration: 'none', fontWeight: 500 }}>{mod.title}</a>
                      </li>
                    ))}
                    {(week.modules || []).length === 0 && <li className="list-group-item" style={{ background: palette.accent, color: palette.text, fontFamily: 'inherit', border: `1px solid ${palette.border}`, borderRadius: 8 }}><em>No modules yet.</em></li>}
                  </ul>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer style={{ background: palette.card, borderRadius: 0 }}>
        {step === 1 && (
          <Button variant="success" onClick={handleCreateAndNext} disabled={submitting} style={{ borderRadius: 24, fontWeight: 600 }}>
            <i className="bi bi-check-circle me-2"></i>Create & Next
          </Button>
        )}
        {step === 2 && (
          <Button variant="primary" onClick={resetForm}><i className="bi bi-check-circle me-2"></i>Done</Button>
        )}
        <Button variant="secondary" onClick={resetForm} style={{ borderRadius: 24, fontWeight: 600 }}>
          <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        {ackMessage && <span className="text-success">{ackMessage}</span>}
      </Modal.Footer>
    </Modal>
  );
};

export default ProgramModal;
