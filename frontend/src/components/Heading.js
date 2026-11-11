import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const Heading = ({ title, text, poste }) => {
  return (
    <header id='page-header'>
      <Container>
        <Row>
          <Col md={10} className='m-auto text-center'>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#BAE6FD',
                marginBottom: '10px',
              }}
            >
              <i className='fas fa-shield-alt' style={{ color: '#FBBF24' }}></i> Portail Officiel de Recrutement
            </div>
            <h1>{title}</h1>
            {poste ? (
              <p style={{ color: '#E2E8F0', fontSize: '14.5px', fontWeight: '600', marginTop: '4px' }}>
                Poste ciblé : <span style={{ color: '#FDE047' }}>{poste}</span>
              </p>
            ) : text ? (
              <p>{text}</p>
            ) : null}
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Heading;
