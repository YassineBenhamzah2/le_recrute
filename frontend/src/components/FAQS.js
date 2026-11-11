import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

const FAQS = () => {
  return (
    <section id='faq' className='p-5 bg-dark text-white'>
      <Container>
        <h1 className='text-center'>Frequently Asked Questions</h1>
        <hr />
        <Row>
          <Col md={6}>
            <div id='accordion'>
              <Card>
                <Card.Title>
                  <h5 className='mb-0'>
                    <a
                      href='#collapseOne'
                      data-toggle='collapse'
                      data-parent='accordion'
                    >
                      Question One
                    </a>
                  </h5>
                </Card.Title>

                <div id='collapseOne' className='collapse'>
                  <Card.Body>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Deserunt ea officiis distinctio exercitationem dolor minus
                    placeat amet commodi, ab a perspiciatis officia nobis
                    reiciendis numquam totam repudiandae molestias nulla, quod
                    voluptatibus modi rerum laboriosam tenetur. Nihil, soluta
                    eaque? Minima, deserunt.
                  </Card.Body>
                </div>
              </Card>

              <Card>
                <Card.Title>
                  <h5 className='mb-0'>
                    <a
                      href='#collapseTwo'
                      data-toggle='collapse'
                      data-parent='accordion'
                    >
                      Question Two
                    </a>
                  </h5>
                </Card.Title>

                <div id='collapseTwo' className='collapse'>
                  <Card.Body>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Deserunt ea officiis distinctio exercitationem dolor minus
                    placeat amet commodi, ab a perspiciatis officia nobis
                    reiciendis numquam totam repudiandae molestias nulla, quod
                    voluptatibus modi rerum laboriosam tenetur. Nihil, soluta
                    eaque? Minima, deserunt.
                  </Card.Body>
                </div>
              </Card>

              <Card>
                <Card.Title>
                  <h5 className='mb-0'>
                    <a
                      href='#collapseThree'
                      data-toggle='collapse'
                      data-parent='accordion'
                    >
                      Question Three
                    </a>
                  </h5>
                </Card.Title>

                <div id='collapseThree' className='collapse'>
                  <Card.Body>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Deserunt ea officiis distinctio exercitationem dolor minus
                    placeat amet commodi, ab a perspiciatis officia nobis
                    reiciendis numquam totam repudiandae molestias nulla, quod
                    voluptatibus modi rerum laboriosam tenetur. Nihil, soluta
                    eaque? Minima, deserunt.
                  </Card.Body>
                </div>
              </Card>
            </div>
          </Col>
          <Col md={6}>
            <div id='accordion'>
              <Card>
                <Card.Title>
                  <h5 className='mb-0'>
                    <a
                      href='#collapseFour'
                      data-toggle='collapse'
                      data-parent='accordion'
                    >
                      Question Four
                    </a>
                  </h5>
                </Card.Title>

                <div id='collapseFour' className='collapse'>
                  <Card.Body>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Deserunt ea officiis distinctio exercitationem dolor minus
                    placeat amet commodi, ab a perspiciatis officia nobis
                    reiciendis numquam totam repudiandae molestias nulla, quod
                    voluptatibus modi rerum laboriosam tenetur. Nihil, soluta
                    eaque? Minima, deserunt.
                  </Card.Body>
                </div>
              </Card>

              <Card>
                <Card.Title>
                  <h5 className='mb-0'>
                    <a
                      href='#collapseFive'
                      data-toggle='collapse'
                      data-parent='accordion'
                    >
                      Question Five
                    </a>
                  </h5>
                </Card.Title>

                <div id='collapseFive' className='collapse'>
                  <Card.Body>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Deserunt ea officiis distinctio exercitationem dolor minus
                    placeat amet commodi, ab a perspiciatis officia nobis
                    reiciendis numquam totam repudiandae molestias nulla, quod
                    voluptatibus modi rerum laboriosam tenetur. Nihil, soluta
                    eaque? Minima, deserunt.
                  </Card.Body>
                </div>
              </Card>

              <Card>
                <Card.Title>
                  <h5 className='mb-0'>
                    <a
                      href='#collapseSix'
                      data-toggle='collapse'
                      data-parent='accordion'
                    >
                      Question Six
                    </a>
                  </h5>
                </Card.Title>

                <div id='collapseSix' className='collapse'>
                  <Card.Body>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Deserunt ea officiis distinctio exercitationem dolor minus
                    placeat amet commodi, ab a perspiciatis officia nobis
                    reiciendis numquam totam repudiandae molestias nulla, quod
                    voluptatibus modi rerum laboriosam tenetur. Nihil, soluta
                    eaque? Minima, deserunt.
                  </Card.Body>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default FAQS;
