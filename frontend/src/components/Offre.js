import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Button from '@restart/ui/esm/Button';
import { LinkContainer } from 'react-router-bootstrap';

const Offre = ({ offre, link, href }) => {
  return (
    <Card
      className='my-3  rounded'
      style={{
        backgroundColor: '#fff',
        transition: 'box-shadow 0.25s',
        boxShadow:
          '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
      }}
    >
      <Row className='align-items-center'>
        <Col md={2}>
          <Card.Img
            variant='bottom'
            src={'/assets/images/Logo-AlBaridBank.png'}
          />
        </Col>
        <Col md={10}>
          <Card.Body>
            <Row className='align-items-center fw-bold'>
              <Card.Title as='h5' className='fw-bold'>
                {offre.titre}
              </Card.Title>
            </Row>
            <Row className='align-items-center'>
              <Card.Text>{offre.specialite}</Card.Text>
            </Row>
            <Row className='align-items-center'>
              <Card.Text>{offre.reseau}</Card.Text>
            </Row>
            <Row className='align-items-center'>
              <Col>
                <Card.Text style={{ color: 'green' }} className='fw-bold'>
                  <i className='fas fa-exclamation'></i> {offre.statut}
                </Card.Text>
              </Col>
              <Col>
                <LinkContainer to={link}>
                  <Button className='btn btn-outline-warning btn-sm me-1'>
                    <i className='fas fa-paper-plane'></i>Postuler
                  </Button>
                </LinkContainer>
                <Button className='btn btn-outline-info btn-sm'>
                  <i className='fas fa-download'></i>{' '}
                  <a href={href}> Fiche de poste </a>
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
};

export default Offre;
