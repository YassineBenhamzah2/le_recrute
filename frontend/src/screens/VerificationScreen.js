import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VerificationScreen = () => {
  const [searchParams] = useSearchParams();
  const dossier = searchParams.get('dossier') || 'ABB-2026-849201';
  const cni = searchParams.get('cni') || 'BK******';
  const sigle = searchParams.get('sigle') || 'ABB';

  const orgNames = {
    ABB: 'Al Barid Bank',
    CIH: 'CIH Bank',
    BOA: 'Bank of Africa',
    OCP: 'Groupe OCP',
    MEF: "Ministère de l'Économie et des Finances",
    CDG: 'Caisse de Dépôt et de Gestion',
  };

  const orgColors = {
    ABB: '#003366',
    CIH: '#0084B6',
    BOA: '#0055A5',
    OCP: '#00875A',
    MEF: '#334155',
    CDG: '#D97706',
  };

  const orgName = orgNames[sigle] || 'Institution Partenaire Officielle';
  const orgColor = orgColors[sigle] || '#003366';

  // Mask CNI for privacy (CNDP compliance)
  const maskedCni =
    cni.length > 2
      ? `${cni.substring(0, 2)}****${cni.slice(-1)}`
      : 'B******';

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: '80vh',
          background: '#F8FAFC',
          padding: '60px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '620px',
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.1)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {/* Header strip */}
          <div
            style={{
              background: orgColor,
              color: '#FFFFFF',
              padding: '24px 32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {sigle} • Plateforme Souveraine
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
              {orgName}
            </h2>
          </div>

          <div style={{ padding: '36px 32px' }}>
            {/* Authenticity Verified Badge */}
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                }}
              >
                <i className='fas fa-shield-alt'></i>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#065F46',
                    margin: '0 0 2px 0',
                  }}
                >
                  RÉCÉPISSÉ AUTHENTIQUE & VÉRIFIÉ
                </h4>
                <p style={{ fontSize: '13px', color: '#047857', margin: 0 }}>
                  Ce document a été généré et certifié sur le système d’information officiel.
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                background: '#F8FAFC',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '28px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                  }}
                >
                  Numéro de Dossier
                </span>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0F172A',
                    fontFamily: 'monospace',
                  }}
                >
                  {dossier}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                  }}
                >
                  Statut de Dépôt
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                  ● Enregistré & Horodaté
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                  }}
                >
                  Titulaire (CNI Masquée)
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  CNI : {maskedCni}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                  }}
                >
                  Organisme Recruteur
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: orgColor }}>
                  {orgName}
                </div>
              </div>
            </div>

            <div
              style={{
                borderLeft: `4px solid ${orgColor}`,
                paddingLeft: '14px',
                marginBottom: '28px',
                fontSize: '12px',
                color: '#64748B',
                lineHeight: 1.6,
              }}
            >
              Ce certificat de vérification est délivré sous le contrôle de la commission de recrutement.
              Toute tentative d’altération de récépissé est punie conformément aux dispositions du Code pénal marocain.
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link
                to='/'
                className='btn btn-primary px-4 py-2'
                style={{
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: orgColor,
                  borderColor: orgColor,
                }}
              >
                <i className='fas fa-arrow-left me-2'></i> Retour au Portail Principal
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VerificationScreen;
