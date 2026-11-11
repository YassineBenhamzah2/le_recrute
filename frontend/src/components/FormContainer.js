import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const FormContainer = ({ children }) => {
  return (
    <Row className='mt-4'>
      <Col md={1}></Col>
      <Col md={10}>
        <Container
          style={{
            backgroundColor: '#fff',
            transition: 'box-shadow 0.25s',
            boxShadow:
              '0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%)',
          }}
        >
          <Row className='justify-content-md-center'>
            <Col xs={12} ms={6} md={12}>
              {children}
            </Col>
          </Row>
        </Container>
      </Col>
      <Col md={1}></Col>
    </Row>
  );
};

export default FormContainer;
