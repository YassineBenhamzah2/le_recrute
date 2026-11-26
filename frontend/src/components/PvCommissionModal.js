import React from 'react';
import { Modal, Button, Table, Badge, Row, Col } from 'react-bootstrap';
import moment from 'moment';

const PvCommissionModal = ({ show, onHide, candidatures, userInfo }) => {
  if (!candidatures) return null;

  const validCands = candidatures.filter((c) => c.statutCommission === 'VALIDE_COMMISSION' || c.isControl3 || c.conforme === 'CONFORME');
  const rejectedCands = candidatures.filter((c) => c.statutCommission === 'REJETE_COMMISSION' || c.conforme === 'NON CONFORME');

  const currentDate = moment().format('DD/MM/YYYY à HH:mm');
  const sessionYear = moment().format('YYYY');

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal show={show} onHide={onHide} size='xl' centered scrollable>
      <Modal.Header closeButton className='bg-light py-2 px-4'>
        <Modal.Title className='fw-bold text-dark fs-5 d-flex align-items-center gap-2'>
          <i className='fas fa-file-signature text-success'></i>
          Procès-Verbal Officiel de la Commission de Sélection (Session {sessionYear})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='p-4 bg-white print-area'>
        {/* EN-TÊTE OFFICIEL PV */}
        <div className='text-center pb-3 mb-4 border-bottom position-relative'>
          <div className='d-flex align-items-center justify-content-between mb-2'>
            <div className='text-start'>
              <div className='fw-bold text-dark' style={{ fontSize: '13px' }}>ROYAUME DU MAROC</div>
              <small className='text-muted'>Commission Mixte de Sélection RH</small>
            </div>
            <div className='text-center'>
              <h4 className='fw-bold text-primary mb-0' style={{ letterSpacing: '0.05em' }}>
                PROCÈS-VERBAL DE SÉLECTION DÉFINITIVE
              </h4>
              <div className='badge bg-dark px-3 py-1 mt-1'>
                ARBITRAGE COMMISSION FINALE • NIVEAU 3
              </div>
            </div>
            <div className='text-end'>
              <div className='fw-bold text-dark' style={{ fontSize: '13px' }}>EHC GROUP • MAROC</div>
              <small className='text-muted'>Tiers de Confiance Certifié</small>
            </div>
          </div>
          <p className='text-muted small mt-2 mb-0'>
            Document officiel certifiant les résultats de délibération de la Commission d'Audit et de Recrutement.
          </p>
        </div>

        {/* MÉTA-DONNÉES DU PV */}
        <div className='p-3 mb-4 rounded bg-light border'>
          <Row className='g-2 text-dark' style={{ fontSize: '13px' }}>
            <Col sm={4}>
              <span><b>Date de Séance :</b> {currentDate}</span>
            </Col>
            <Col sm={4}>
              <span><b>Président de séance :</b> {userInfo?.prenom} {userInfo?.nom}</span>
            </Col>
            <Col sm={4}>
              <span><b>Type de Concours :</b> Sélection Bancaire & Marchés Publics</span>
            </Col>
            <Col sm={4}>
              <span><b>Total Dossiers Audités :</b> {candidatures.length}</span>
            </Col>
            <Col sm={4}>
              <span className='text-success'><b>Retenus en Shortlist :</b> {validCands.length} candidat(s)</span>
            </Col>
            <Col sm={4}>
              <span className='text-danger'><b>Dossiers Non Retenus :</b> {rejectedCands.length} candidat(s)</span>
            </Col>
          </Row>
        </div>

        {/* 1. LISTE PRINCIPALE DES CANDIDATS RETENUS */}
        <div className='mb-4'>
          <h6 className='fw-bold text-success border-bottom pb-2 d-flex align-items-center justify-content-between'>
            <span><i className='fas fa-check-circle me-2'></i> I. Shortlist Définitive des Candidats Retenus (Classés par Mérite)</span>
            <Badge bg='success'>{validCands.length} Candidats</Badge>
          </h6>
          {validCands.length > 0 ? (
            <Table bordered hover responsive size='sm' className='text-center align-middle' style={{ fontSize: '12.5px' }}>
              <thead className='table-light'>
                <tr>
                  <th style={{ width: '60px' }}>Rang</th>
                  <th>Nom & Prénom</th>
                  <th>CNI</th>
                  <th>Poste Postulé</th>
                  <th>Score Global</th>
                  <th>Statut Commission</th>
                </tr>
              </thead>
              <tbody>
                {validCands
                  .sort((a, b) => (b.scoreTotal || 0) - (a.scoreTotal || 0))
                  .map((c, idx) => (
                    <tr key={c._id || idx}>
                      <td className='fw-bold text-dark'>#{idx + 1}</td>
                      <td className='fw-bold text-start ps-3 text-primary'>{c.prenom} {c.nom}</td>
                      <td className='font-monospace'>{c.cni || c.user?.cni || '-'}</td>
                      <td>{c.poste || '-'}</td>
                      <td>
                        <span className='badge bg-warning text-dark fw-bold px-2 py-1'>
                          {Number(c.scoreTotal || 0).toFixed(2)} pts
                        </span>
                      </td>
                      <td>
                        <Badge bg='success'>Retenu Shortlist</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <div className='text-muted small p-3 bg-light rounded text-center'>
              Aucun candidat validé en shortlist pour l'instant.
            </div>
          )}
        </div>

        {/* 2. LISTE DES DOSSIERS ÉCARTÉS */}
        {rejectedCands.length > 0 && (
          <div className='mb-4'>
            <h6 className='fw-bold text-danger border-bottom pb-2 d-flex align-items-center justify-content-between'>
              <span><i className='fas fa-times-circle me-2'></i> II. Dossiers Écartés avec Motifs Légaux d'Arbitrage</span>
              <Badge bg='danger'>{rejectedCands.length} Dossiers</Badge>
            </h6>
            <Table bordered hover responsive size='sm' className='text-center align-middle' style={{ fontSize: '12px' }}>
              <thead className='table-light'>
                <tr>
                  <th>Candidat</th>
                  <th>CNI</th>
                  <th>Poste</th>
                  <th>Motif Légal de Rejet</th>
                  <th>Détail / Motif Arbitré</th>
                </tr>
              </thead>
              <tbody>
                {rejectedCands.map((c, idx) => (
                  <tr key={c._id || idx}>
                    <td className='fw-bold text-start ps-3'>{c.prenom} {c.nom}</td>
                    <td className='font-monospace'>{c.cni || c.user?.cni || '-'}</td>
                    <td>{c.poste || '-'}</td>
                    <td className='text-danger fw-bold'>{c.motif || c.dossier || 'Non Conforme'}</td>
                    <td className='text-muted small text-start'>{c.controle3 || c.controle2 || 'Critères officiels non remplis'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* ZONE DE SIGNATURES OFFICIELLES */}
        <div className='mt-5 pt-3 border-top'>
          <div className='row text-center' style={{ fontSize: '12px' }}>
            <div className='col-4'>
              <div className='fw-bold mb-5'>Le Rapporteur de la Commission</div>
              <div className='text-muted border-top mx-3 pt-2'>(Signature & Cachet)</div>
            </div>
            <div className='col-4'>
              <div className='fw-bold mb-5'>L'Auditeur RH Certifié (EHC)</div>
              <div className='text-muted border-top mx-3 pt-2'>(Signature & Cachet)</div>
            </div>
            <div className='col-4'>
              <div className='fw-bold mb-5'>Le Président de la Commission</div>
              <div className='text-muted border-top mx-3 pt-2'>(Signature & Cachet)</div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className='bg-light d-flex justify-content-between px-4'>
        <Button variant='secondary' onClick={onHide}>
          Fermer
        </Button>
        <div className='d-flex gap-2'>
          <Button variant='primary' className='fw-bold shadow-sm' onClick={handlePrint}>
            <i className='fas fa-print me-2'></i> Imprimer le PV / Exporter PDF
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PvCommissionModal;
