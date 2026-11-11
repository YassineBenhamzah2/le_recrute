import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        padding: '40px 0 25px 0',
        marginTop: '60px',
        borderTop: '1px solid #1E293B',
        fontSize: '13px',
      }}
    >
      <Container style={{ maxWidth: '1360px' }}>
        <Row className='gy-4 align-items-center mb-4'>
          <Col md={6}>
            <div className='d-flex align-items-center gap-2 mb-2'>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#1D4ED8',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '15px',
                }}
              >
                <i className='fas fa-landmark'></i>
              </div>
              <strong style={{ color: '#fff', fontSize: '17px', letterSpacing: '-0.02em' }}>
                Recrutement<span style={{ color: '#38BDF8' }}>.ma</span>
              </strong>
            </div>
            <p style={{ margin: 0, maxWidth: '480px', lineHeight: '1.6', color: '#94A3B8' }}>
              Plateforme nationale centralisée des concours de recrutement pour les établissements publics et institutions financières au Maroc.
            </p>
          </Col>
          <Col md={6} className='text-md-end'>
            <div className='d-flex flex-wrap justify-content-md-end gap-3'>
              <span className='badge' style={{ background: '#1E293B', color: '#CBD5E1', padding: '6px 12px' }}>
                Al Barid Bank
              </span>
              <span className='badge' style={{ background: '#1E293B', color: '#CBD5E1', padding: '6px 12px' }}>
                CIH Bank
              </span>
              <span className='badge' style={{ background: '#1E293B', color: '#CBD5E1', padding: '6px 12px' }}>
                Groupe OCP
              </span>
              <span className='badge' style={{ background: '#1E293B', color: '#CBD5E1', padding: '6px 12px' }}>
                Ministère des Finances
              </span>
              <span className='badge' style={{ background: '#1E293B', color: '#CBD5E1', padding: '6px 12px' }}>
                Bank of Africa
              </span>
              <span className='badge' style={{ background: '#1E293B', color: '#CBD5E1', padding: '6px 12px' }}>
                CDG
              </span>
            </div>
          </Col>
        </Row>

        <div
          style={{
            borderTop: '1px solid #1E293B',
            paddingTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ color: '#64748B', fontSize: '12px' }}>
            © {new Date().getFullYear()} Experts Human Capital & Partenaires Institutionnels. Tous droits réservés.
          </div>
          <div style={{ color: '#64748B', fontSize: '12px' }}>
            <i className='fas fa-shield-alt text-success me-1'></i> Conforme aux normes CNDP (Loi 09-08) & Horodatage Officiel
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
