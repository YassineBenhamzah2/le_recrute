import { css } from '@emotion/react';
import ClockLoader from 'react-spinners/ClockLoader';
import { Container } from 'react-bootstrap';

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Spinner = ({ size }) => {
  return (
    <Container className='sweet-loading mt-3 mb-3'>
      <ClockLoader color={'#000'} loading={true} css={override} size={size} />
    </Container>
  );
};

export default Spinner;
