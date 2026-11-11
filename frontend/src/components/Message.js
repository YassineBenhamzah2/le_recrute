import React from 'react';
import { Alert } from 'react-bootstrap';

const Message = ({ variant, children }) => (
  <Alert className='text-center fw-bold' variant={variant}>
    {' '}
    {children}
  </Alert>
);

Message.defaultProps = {
  variant: 'info',
};

export default Message;
