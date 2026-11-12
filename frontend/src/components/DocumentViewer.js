import React, { useState } from 'react';
import { getFileUrl } from '../utils/fileUrl';

const DocumentViewer = ({
  url,
  title = 'Document Justificatif',
  height = '580px',
  declaredInfo = null,
  showActions = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!url || url === 'undefined' || url === 'null') {
    return (
      <div className='bg-white p-4 rounded-3 border shadow-sm'>
        {declaredInfo}
        <div className='text-center py-5 text-muted border rounded-3 bg-light'>
          <div className='mb-3'>
            <i className='fas fa-file-excel fa-3x text-secondary opacity-50'></i>
          </div>
          <h6 className='fw-bold text-secondary mb-1'>Aucun document téléversé</h6>
          <p className='small text-muted mb-0'>
            Le candidat n'a pas joint de justificatif numérisé pour cette pièce.
          </p>
        </div>
      </div>
    );
  }

  const resolvedUrl = getFileUrl(url);
  const cleanUrl = String(url).split('?')[0].toLowerCase();
  const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(cleanUrl);
  const filename = String(url).split('/').pop() || 'document.pdf';

  return (
    <div className='bg-white p-3 rounded-3 border shadow-sm'>
      {/* Barre d'en-tête du document */}
      <div className='d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom'>
        <div className='d-flex align-items-center gap-2'>
          <span className={`badge ${isImage ? 'bg-info' : 'bg-danger'} p-2 d-flex align-items-center gap-1`}>
            <i className={`fas ${isImage ? 'fa-file-image' : 'fa-file-pdf'} fa-sm`}></i>
            <span className='fw-bold' style={{ fontSize: '11px' }}>{isImage ? 'IMAGE' : 'DOCUMENT PDF'}</span>
          </span>
          <div>
            <h6 className='fw-bold text-dark m-0' style={{ fontSize: '14px' }}>
              {title}
            </h6>
            <div className='text-muted font-monospace' style={{ fontSize: '11px' }} title={filename}>
              {filename.length > 40 ? `${filename.substring(0, 37)}...` : filename}
            </div>
          </div>
        </div>

        {showActions && (
          <div className='d-flex align-items-center gap-2'>
            {isImage && (
              <div className='btn-group btn-group-sm me-1' role='group'>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  title='Zoomer'
                >
                  <i className='fas fa-search-plus'></i>
                </button>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  title='Dézoomer'
                >
                  <i className='fas fa-search-minus'></i>
                </button>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => setZoomLevel(1)}
                  title='Réinitialiser le zoom'
                >
                  <i className='fas fa-undo-alt'></i>
                </button>
              </div>
            )}
            <a
              href={resolvedUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='btn btn-sm btn-primary fw-bold px-3 d-inline-flex align-items-center gap-1'
            >
              <i className='fas fa-external-link-alt'></i>
              <span>Plein écran</span>
            </a>
            <a
              href={resolvedUrl}
              download={filename}
              className='btn btn-sm btn-outline-secondary fw-bold d-inline-flex align-items-center gap-1'
              title='Télécharger sur votre ordinateur'
            >
              <i className='fas fa-download'></i>
              <span className='d-none d-sm-inline'>Télécharger</span>
            </a>
          </div>
        )}
      </div>

      {/* Informations déclarées par le candidat pour cette pièce */}
      {declaredInfo}

      {/* Zone de prévisualisation directe */}
      <div
        style={{
          height,
          backgroundColor: '#0f172a08',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isImage ? (
          <div
            className='w-100 h-100 d-flex align-items-center justify-content-center p-3'
            style={{ overflow: 'auto', backgroundColor: '#f8fafc' }}
          >
            <img
              src={resolvedUrl}
              alt={title}
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              }}
            />
          </div>
        ) : (
          <object
            data={`${resolvedUrl}#toolbar=1&navpanes=0&view=FitH`}
            type='application/pdf'
            width='100%'
            height='100%'
            style={{ display: 'block', border: 'none' }}
          >
            <embed
              src={`${resolvedUrl}#toolbar=1&navpanes=0&view=FitH`}
              type='application/pdf'
              width='100%'
              height='100%'
            />
            <iframe
              src={`${resolvedUrl}#toolbar=1&navpanes=0&view=FitH`}
              title={title}
              width='100%'
              height='100%'
              style={{ border: 'none' }}
            >
              <div className='p-4 text-center h-100 d-flex flex-column align-items-center justify-content-center bg-white'>
                <i className='fas fa-file-pdf text-danger fa-4x mb-3'></i>
                <h6 className='fw-bold text-dark'>{title}</h6>
                <p className='text-muted small mb-3' style={{ maxWidth: '400px' }}>
                  Le visualiseur PDF intégré de votre navigateur est restreint dans cette boîte de dialogue.
                </p>
                <div className='d-flex gap-2 justify-content-center'>
                  <a
                    href={resolvedUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='btn btn-primary fw-bold btn-sm px-3 py-2'
                  >
                    <i className='fas fa-external-link-alt me-1'></i> Ouvrir le document PDF
                  </a>
                  <a
                    href={resolvedUrl}
                    download={filename}
                    className='btn btn-outline-secondary fw-bold btn-sm px-3 py-2'
                  >
                    <i className='fas fa-download me-1'></i> Télécharger
                  </a>
                </div>
              </div>
            </iframe>
          </object>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;

