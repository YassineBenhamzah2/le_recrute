import Button from '@restart/ui/esm/Button';
import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

const ContactUs = () => {
  return (
    <div>
      <section id='contact'>
        <Container>
          <Row className='text-center'>
            <Col>
              <h3 className='text-center'>Assistance</h3>
              <hr />
              <h4>Email</h4>
              <p>assistance.recrutement.abb@expertshumancapital.com </p>
              <h4>Telephone</h4>
              <p>06.56.16.65.50 (appel et whatsapp)</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ContactUs;
