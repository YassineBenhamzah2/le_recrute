import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const CardItem = ({ backgroud, icon, title, number, color, onClick }) => {
  return (
    <Card
      bg={backgroud}
      className='mb-2 mt-3 pt-3 ps-3 pb-3 fw-bold '
      style={color}
      onClick={onClick}
    >
      <Row>
        <Col>
          <Card.Title>{number}</Card.Title>
        </Col>
        <Col>
          <i className={icon}></i>
        </Col>
      </Row>

      <Card.Text className='mr-3'>{title}</Card.Text>
    </Card>
  );
};

export default CardItem;
