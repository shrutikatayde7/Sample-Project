
import React from 'react';
import { Card, Table, Button, Spinner, Alert, Badge, InputGroup, Form, Modal } from 'react-bootstrap';

const SchedulesTable = ({
  filteredGroupedSchedules = [],
  allProgramWeeks = [],
  searchEmployee = '',
  setSearchEmployee = () => {},
  scheduleLoading = false,
  allProgramWeeksLoading = false,
  scheduleError = '',
  openScheduleDetailsId,
  handleScheduleTitleClick = () => {},
  inlineScheduleList = [],
  inlineScheduleLoading = false,
  getScheduleProgress = () => 0,
  handleDeleteScheduleInline = () => {},
  showProgramScheduleModal = false,
  setShowProgramScheduleModal = () => {},
  selectedProgramForSchedules = null,
  selectedProgramSchedules = [],
  handleDeleteScheduleFromModal = () => {},
  gradientHeader = {},
  palette = {},
  cardStyle = {},
}) => (
  <Card className="mb-4 shadow-lg" style={{ borderRadius: 0, background: palette.card, color: palette.text, fontFamily: cardStyle.fontFamily }}>
    <Card.Header className="bg-gradient text-dark" style={gradientHeader}>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="mb-0 text-secondary" style={{ fontWeight: 700, color: palette.primary }}>Schedules</h4>
        <div style={{ minWidth: 320 }}>
          <InputGroup>
            <Form.Control
              type="email"
              placeholder="Search by employee email ID"
              value={searchEmployee}
              onChange={e => setSearchEmployee(e.target.value)}
              style={{ borderRadius: 8, border: `1px solid ${palette.border}`, fontFamily: cardStyle.fontFamily, color: palette.text, background: palette.section }}
            />
            {searchEmployee && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchEmployee('')}
                title="Clear"
                style={{ borderRadius: 8, border: `1px solid ${palette.border}` }}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </InputGroup>
        </div>
      </div>
    </Card.Header>
    <Card.Body style={{ background: palette.card }}>
      {scheduleLoading || allProgramWeeksLoading ? (
        <Spinner animation="border" />
      ) : scheduleError ? (
        <Alert variant="danger">{scheduleError}</Alert>
      ) : filteredGroupedSchedules.length === 0 ? (
        <Alert variant="info">
          {searchEmployee
            ? <>No schedules found for <b>{searchEmployee}</b>.</>
            : <>No schedules yet.</>
          }
        </Alert>
      ) : (
  <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: 0, overflow: 'hidden', background: '#e9fbe5', fontFamily: cardStyle.fontFamily, color: '#1a4d1a' }}>
      <thead style={{ background: '#2ecc40', color: '#fff', fontSize: '1.15rem', letterSpacing: 1 }}>
        <tr>
          <th style={{ fontWeight: 800, border: 'none' }}>Program</th>
          <th style={{ fontWeight: 800, border: 'none' }}>Weeks</th>
          <th style={{ fontWeight: 800, border: 'none' }}>Total Modules</th>
          <th style={{ fontWeight: 800, border: 'none' }}>No of trainees</th>
        </tr>
      </thead>
      <tbody>
        {filteredGroupedSchedules.map(({ program, schedules }) => {
          const programWeeks = allProgramWeeks.filter(w => String(w.program_id) === String(program.id));
          const modulesCount = programWeeks.reduce(
            (sum, w) => sum + (Array.isArray(w.modules) ? w.modules.length : 0),
            0
          );
          const weeksCount = programWeeks.length > 0
            ? programWeeks.length
            : (typeof program.weeks_count === 'number' ? program.weeks_count : 0);
          const traineesCount = schedules.length;
          return (
            <React.Fragment key={program.id}>
              <tr style={{ ...cardStyle, background: '#28a745', color: '#1a4d1a' }}>
                <td>
                  <span
                    style={{ fontWeight: 500, color: '#28a745', cursor: 'pointer' }}
                    onClick={() => handleScheduleTitleClick(program)}
                    onMouseOver={e => e.target.style.cursor = 'pointer'}
                  >
                    {program.title}
                  </span>
                </td>
                <td><span style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', background: '#28a745', color: '#fff' }}>{weeksCount}</span></td>
                <td><span style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', background: '#28a745', color: '#fff' }}>{modulesCount}</span></td>
                <td><span style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', background: '#28a745', color: '#fff' }}>{traineesCount}</span></td>
              </tr>
              {openScheduleDetailsId === program.id && (
                <tr>
                  <td colSpan={5} style={{  padding: 0 }}>
                    <div style={{ padding: 16 }}>
                      {inlineScheduleLoading ? (
                        <Spinner animation="border" />
                      ) : inlineScheduleList.length === 0 ? (
                        <Alert variant="info">No schedules for this program.</Alert>
                      ) : (
                        <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: 0, overflow: 'hidden', background: '#e9fbe5', fontFamily: cardStyle.fontFamily, color: '#1a4d1a' }}>
                          <thead style={{ background: '#2ecc40', color: '#fff', fontSize: '1.05rem', letterSpacing: 1 }}>
                            <tr>
                              <th style={{ fontWeight: 800, border: 'none' }}>Email</th>
                              <th style={{ fontWeight: 800, border: 'none' }}>Start Date</th>
                              <th style={{ fontWeight: 800, border: 'none' }}>End Date</th>
                              <th style={{ fontWeight: 800, border: 'none' }}>Progress</th>
                              <th style={{ fontWeight: 800, border: 'none' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inlineScheduleList.map(s => {
                              const percent = getScheduleProgress(s, program.id);
                              return (
                                <tr key={s.id} style={{ ...cardStyle, background: '#d4f7c5', color: '#1a4d1a' }}>
                                  <td>{s.email}</td>
                                  <td>{s.start_date}</td>
                                  <td>{s.end_date}</td>
                                  <td>
                                    <Badge bg={percent === 100 ? "success" : "secondary"} style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', border: 'none', fontFamily: cardStyle.fontFamily, background: percent === 100 ? '#2ecc40' : '#b6e6a2', color: '#fff' }}>{percent}%</Badge>
                                  </td>
                                  <td>
                                    <Button
                                      size="sm"
                                      variant="outline-success"
                                      style={{ borderRadius: 8, fontWeight: 600, fontFamily: cardStyle.fontFamily, color: '#2ecc40', borderColor: '#2ecc40' }}
                                      onClick={() => handleDeleteScheduleInline(s.id, program.id)}
                                      title="Delete this employee schedule"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </Table>
      )}
    </Card.Body>
    <Modal show={showProgramScheduleModal} onHide={() => setShowProgramScheduleModal(false)} centered size="lg">
      <Modal.Header closeButton style={gradientHeader}>
        <Modal.Title>
          Schedules for Program: {selectedProgramForSchedules?.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: palette.section }}>
        {selectedProgramSchedules.length === 0 ? (
          <Alert variant="info">No schedules for this program.</Alert>
        ) : (
          <Table striped bordered hover responsive style={{ borderRadius: 0, background: palette.card, fontFamily: cardStyle.fontFamily, color: palette.text }}>
            <thead style={{ background: palette.card, color: '#fff' }}>
              <tr>
                <th>Email</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Is Finished</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedProgramSchedules.map(s => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td>{s.start_date}</td>
                  <td>{s.end_date}</td>
                  <td>{s.is_finished ? <Badge bg="success" style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', border: 'none', fontFamily: cardStyle.fontFamily }}>Yes</Badge> : <Badge bg="secondary" style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', border: 'none', fontFamily: cardStyle.fontFamily }}>No</Badge>}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      style={{ borderRadius: 8, fontWeight: 600, fontFamily: cardStyle.fontFamily, color: palette.danger }}
                      onClick={() => handleDeleteScheduleFromModal(s.id)}
                      title="Delete this employee schedule"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  </Card>
);

export default SchedulesTable;
