import React from 'react';
import { Card, Table, Button, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';

const ProgramTable = ({
  programs,
  tableLoading,
  tableError,
  openProgramDetailsId,
  openProgramModal,
  handleProgramTitleClick,
  openEditModal,
  openScheduleModalForProgram,
  handleCopyProgram,
  handleDeleteProgram,
  inlineDetailsLoading,
  inlineDetailsError,
  inlineDetailsWeeks,
  badgeInfo,
  actionBtn,
  palette,
  cardStyle,
  badgeSecondary,
  setShowModal
}) => (
  <Card className="mb-4 shadow-lg" style={{ borderRadius: 0, background: palette.card, color: palette.text, fontFamily: cardStyle.fontFamily }}>
  <Card.Header className="bg-gradient text-dark" style={{ background: '#fff', color: palette.primary, fontWeight: 700, fontSize: '1.4rem', letterSpacing: 1, padding: '18px 24px', border: 'none', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 2px 8px rgba(40,167,69,0.10)', borderBottom: '1px solid #e0e0e0' }}>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="mb-0 text-secondary" style={{ fontWeight: 700, color: palette.primary }}>Programs</h4>
  <Button variant="success" className="px-4 py-2 sticky-new-program" style={{ fontWeight: 700, borderRadius: 24, boxShadow: '0 2px 12px rgba(40,167,69,0.10)', fontFamily: cardStyle.fontFamily, fontSize: '1.1rem', transition: 'all 0.2s', border: 'none', position: 'relative', zIndex: 30 }} onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i> New Program
        </Button>
      </div>
    </Card.Header>
    <Card.Body style={{ background: palette.card }}>
      {tableLoading && <Spinner animation="border" />}
      {tableError && <Alert variant="danger">{tableError}</Alert>}
      {!tableLoading && programs.length === 0 && <Alert variant="info">No programs yet.</Alert>}
      {!tableLoading && programs.length > 0 && (
        <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: 0, overflow: 'hidden', background: palette.card, fontFamily: cardStyle.fontFamily, color: palette.text }}>
          <thead style={{ background: palette.primary, color: '#fff', fontSize: '1.15rem', letterSpacing: 1 }}>
            <tr>
              {/* <th style={{ fontWeight: 800, border: 'none' }}>ID</th> */}
              <th style={{ fontWeight: 800, border: 'none' }}>Title</th>
              <th style={{ fontWeight: 800, border: 'none' }}>Weeks</th>
              <th style={{ fontWeight: 800, border: 'none' }}>Created</th>
              <th style={{ fontWeight: 800, border: 'none' }}>Updated</th>
              <th style={{ fontWeight: 800, border: 'none' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <React.Fragment key={p.id}>
                <tr style={{ ...cardStyle, background: '#28a745', color: '#1a4d1a' }}>
                  {/* <td>
                    <span
                      style={{ fontWeight: 500, color: '#28a745', cursor: 'pointer' }}
                      onClick={() => handleProgramTitleClick(p)}
                    >{p.id}</span>
                  </td> */}
                  <td>
                    <span
                      style={{ fontWeight: 500, color: '#28a745', cursor: 'pointer' }}
                      onClick={() => handleProgramTitleClick(p)}
                    >{p.title}</span>
                  </td>
                  <td><span style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px', background: '#28a745', color: '#fff' }}>{typeof p.weeks_count === 'number' ? p.weeks_count : '-'}</span></td>
                  <td>{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
                  <td>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '-'}</td>
                  <td>
                    <Button size="sm" style={actionBtn} onClick={() => openEditModal(p)} title="Edit"><i className="bi bi-pencil"></i></Button>
                    <Button size="sm" style={actionBtn} onClick={() => openScheduleModalForProgram(p)} title="Schedule"><i className="bi bi-calendar-plus"></i></Button>
                    <Button size="sm" style={actionBtn} onClick={() => handleCopyProgram(p.id)} title="Copy"><i className="bi bi-files"></i></Button>
                    <Button size="sm" style={{ ...actionBtn, color: palette.card }} onClick={() => handleDeleteProgram(p.id)} title="Delete"><i className="bi bi-trash"></i></Button>
                  </td>
                </tr>
                {openProgramDetailsId === p.id && (
                  <tr>
                    <td colSpan={6} style={{ background: palette.section, padding: 0 }}>
                      <div style={{ padding: 16 }}>
                        {inlineDetailsLoading && <Spinner animation="border" />}
                        {inlineDetailsError && <Alert variant="danger">{inlineDetailsError}</Alert>}
                        {!inlineDetailsLoading && !inlineDetailsError && inlineDetailsWeeks.length === 0 && (<Alert variant="info">No weeks yet.</Alert>)}
                        {!inlineDetailsLoading && !inlineDetailsError && inlineDetailsWeeks.length > 0 && (
                          <Row>
                            {inlineDetailsWeeks.sort((a, b) => a.week_number - b.week_number).map(w => (
                              <Col md={6} key={w.id} className="mb-3">
                                <Card className="shadow-sm" style={{ ...cardStyle, borderRadius: 0 }}>
                                  <Card.Header style={{ background: palette.primary, color: '#fff', borderRadius: 0 }}><strong>Week {w.week_number}</strong></Card.Header>
                                  <Card.Body>
                                    <ul className="list-group">
                                      {(w.modules || []).length === 0 && <li className="list-group-item"><em>No modules yet.</em></li>}
                                      {(w.modules || []).map(m => (
                                        <li key={m.id} className="list-group-item d-flex align-items-center">
                                          <span className="me-2">{typeof m.is_finished === 'boolean' ? (m.is_finished ? '\u2705' : '\u23f3') : '\u2022'}</span>
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
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}
  </Card.Body>
  </Card>
);

export default ProgramTable;
