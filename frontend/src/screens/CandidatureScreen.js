import React, { useEffect } from 'react';
import { Button, Row, Col, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getCandidatureDetails } from '../actions/candidatureActions';
import Message from '../components/Message';
import Heading from '../components/Heading';
import PostulationSteps from '../components/PostulationSteps';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import Pdf from 'react-to-pdf';
import { useParams } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OfficialReceiptPDF from '../components/OfficialReceiptPDF';

const CandidatureScreen = () => {
  const ref = React.createRef();
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const candidatureDetails = useSelector((state) => state.candidatureDetails);
  const {
    loading: loadingCandidature,
    error: errorCandidature,
    candidature,
  } = candidatureDetails;

  const candidatureCreate = useSelector((state) => state.candidatureCreate);
  const { success: successCandidature } = candidatureCreate;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getCandidatureDetails(params.id));
    }
  }, [userInfo, navigate, dispatch, params]);

  const options = {
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  };

  const receiptFileName = `recepisse-${candidature?.numeroDossier || 'officiel'}.pdf`;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Header />
      <Heading title='Récépissé Officiel de Dépôt de Candidature' />
      {successCandidature ? (
        <PostulationSteps now={100} />
      ) : (
        <PostulationSteps step1 step2 step3 step4 now={100} />
      )}

      <Container className='py-4' style={{ maxWidth: '960px' }}>
        {errorCandidature && (
          <Message variant='danger'>{errorCandidature}</Message>
        )}

        {loadingCandidature ? (
          <div className='text-center py-5'>
            <Spinner size='120' />
            <p className='mt-3 text-muted fw-bold'>Génération du récépissé officiel sécurisé...</p>
          </div>
        ) : (
          <>
            {/* ACTION BAR */}
            <div
              className='d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-white border rounded shadow-sm'
              style={{ gap: '12px' }}
            >
              <div>
                <span className='badge bg-success-subtle text-success p-2 fs-6 me-2'>
                  <i className='fas fa-check-circle me-1'></i> Candidature Enregistrée & Certifiée
                </span>
                <span className='text-muted small d-none d-md-inline'>
                  Accusé électronique horodaté avec QR code de vérification
                </span>
              </div>

              <div className='d-flex align-items-center gap-2'>
                <Link
                  to='/profile'
                  className='btn btn-outline-secondary px-3 py-2'
                  style={{ borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  <i className='fas fa-folder me-1'></i> Mon Espace Candidat
                </Link>

                <Button
                  onClick={() => window.print()}
                  variant='outline-dark'
                  className='px-3 py-2'
                  style={{ borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  <i className='fas fa-print me-1'></i> Imprimer
                </Button>

                <Pdf
                  targetRef={ref}
                  filename={receiptFileName}
                  options={options}
                >
                  {({ toPdf }) => (
                    <Button
                      onClick={toPdf}
                      variant='primary'
                      className='px-4 py-2 shadow-sm'
                      style={{
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '13px',
                        backgroundColor: '#003366',
                        borderColor: '#003366',
                      }}
                    >
                      <i className='fas fa-file-pdf me-2'></i> Télécharger PDF
                    </Button>
                  )}
                </Pdf>
              </div>
            </div>

            {/* A4 OFFICIAL CERTIFICATE */}
            {candidature && (
              <OfficialReceiptPDF
                ref={ref}
                candidature={candidature}
                userInfo={userInfo}
              />
            )}
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default CandidatureScreen;
