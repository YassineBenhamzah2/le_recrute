import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

const PostulationSteps = ({ step1, step2, step3, step4, now }) => {
  const params = useParams();
  const safePoste = encodeURIComponent(params.poste || '');

  const steps = [
    { num: 1, label: 'Connexion', icon: 'fa-sign-in-alt', active: !!step1, done: !!(step2 || step3 || step4), link: '/login' },
    { num: 2, label: 'Informations Personnelles', icon: 'fa-user', active: !!step2, done: !!(step3 || step4), link: `/poste/${safePoste}/informations-personnelles` },
    { num: 3, label: 'Diplômes & Notes', icon: 'fa-graduation-cap', active: !!step3, done: !!step4, link: `/poste/${safePoste}/diplomes` },
    { num: 4, label: 'Expériences & Dépôt', icon: 'fa-briefcase', active: !!step4, done: false, link: `/poste/${safePoste}/experiences` },
  ];

  return (
    <Container style={{ maxWidth: '980px', marginTop: '20px', marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          padding: '14px 22px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        {steps.map((s, idx) => {
          const isCurrent =
            (idx === 0 && step1 && !step2) ||
            (idx === 1 && step2 && !step3) ||
            (idx === 2 && step3 && !step4) ||
            (idx === 3 && step4);
          const isCompleted = s.done;

          return (
            <React.Fragment key={s.num}>
              <Link
                to={s.link}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: isCurrent ? '#1D4ED8' : isCompleted ? '#0F172A' : '#94A3B8',
                  fontWeight: isCurrent ? '700' : '600',
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCurrent ? '#1D4ED8' : isCompleted ? '#DCFCE7' : '#F1F5F9',
                    color: isCurrent ? '#FFFFFF' : isCompleted ? '#16A34A' : '#94A3B8',
                    fontSize: '12px',
                    fontWeight: '800',
                    transition: 'all 0.2s',
                    boxShadow: isCurrent ? '0 2px 6px rgba(29, 78, 216, 0.3)' : 'none',
                  }}
                >
                  {isCompleted ? <i className='fas fa-check'></i> : s.num}
                </div>
                <span className='d-none d-md-inline'>
                  {s.label}
                </span>
              </Link>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isCompleted ? '#16A34A' : '#E2E8F0',
                    margin: '0 12px',
                  }}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Container>
  );
};

export default PostulationSteps;
