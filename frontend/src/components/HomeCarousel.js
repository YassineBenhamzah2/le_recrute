import React from 'react';
import { Image, Row } from 'react-bootstrap';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import { boolean, number } from '@storybook/addon-knobs';
import Button from '@restart/ui/esm/Button';

const HomeCarousel = () => {
  const tooglesGroupId = 'Toggles';
  const valuesGroupId = 'Values';
  const mainGroupId = 'Main';

  const getConfigurableProps = () => ({
    showArrows: boolean('showArrows', true, tooglesGroupId),
    showStatus: boolean('showStatus', true, tooglesGroupId),
    showIndicators: boolean('showIndicators', true, tooglesGroupId),
    infiniteLoop: boolean('infiniteLoop', true, tooglesGroupId),
    showThumbs: boolean('showThumbs', true, tooglesGroupId),
    useKeyboardArrows: boolean('useKeyboardArrows', true, tooglesGroupId),
    autoPlay: boolean('autoPlay', true, tooglesGroupId),
    stopOnHover: boolean('stopOnHover', true, tooglesGroupId),
    swipeable: boolean('swipeable', true, tooglesGroupId),
    dynamicHeight: boolean('dynamicHeight', true, tooglesGroupId),
    emulateTouch: boolean('emulateTouch', true, tooglesGroupId),
    autoFocus: boolean('autoFocus', false, tooglesGroupId),
    thumbWidth: number('thumbWidth', 100, {}, valuesGroupId),
    selectedItem: number('selectedItem', 0, {}, valuesGroupId),
    interval: number('interval', 4000, {}, valuesGroupId),
    transitionTime: number('transitionTime', 1500, {}, valuesGroupId),
    swipeScrollTolerance: number('swipeScrollTolerance', 5, {}, valuesGroupId),
    // ariaLabel: text('ariaLabel', undefined),
  });

  return (
    <Carousel {...getConfigurableProps()}>
      <Row>
        <Image
          style={{ width: '100%', height: '100%' }}
          src='assets/images/background.jpg'
        />
        <p className='legend'>
          <h1 style={{ color: 'white' }}>Vous cherchez un emploi</h1>
        </p>
      </Row>
      <Row>
        <Image
          style={{ width: '2000px', height: '563px' }}
          src='assets/images/car2.jpg'
        />
        <p className='legend'>
          <h1 style={{ color: 'white' }}>Procedure simple de recrutement</h1>
        </p>
      </Row>
      <Row>
        <Image
          style={{ width: '2000px', height: '563px' }}
          src='assets/images/Albarid-Bank20.jpg'
        />
        <p className='legend'>
          <h1 style={{ color: 'white' }}>A propos de nous</h1>
        </p>
        <Button>Lire la suite</Button>
      </Row>
    </Carousel>
  );
};

export default HomeCarousel;
