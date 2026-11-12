import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { getFileUrl } from '../utils/fileUrl';

// Configuration du Worker PDF local (aucun CDN externe requis)
try {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
} catch (e) {
  console.warn('Worker initialization warning:', e);
}

const DocumentViewer = ({
  url,
  title = 'Document Justificatif',
  height = '620px',
  declaredInfo = null,
  showActions = true,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [pdfError, setPdfError] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  if (!url || url === 'undefined' || url === 'null') {
    return (
      <div className='bg-white p-4 rounded-3 border shadow-sm'>
        {declaredInfo}
        <div className='text-center py-5 text-muted border rounded-3 bg-light'>
          <div className='mb-3'>
            <i className='fas fa-folder-open fa-3x text-secondary opacity-50'></i>
          </div>
          <h6 className='fw-bold text-secondary mb-1'>Aucun document téléversé</h6>
          <p className='small text-muted mb-0'>
            Le candidat n'a pas joint de justificatif pour cette pièce.
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
          <span className={`badge ${isImage ? 'bg-info text-white' : 'bg-danger text-white'} p-2 d-flex align-items-center gap-1`}>
            <i className={`fas ${isImage ? 'fa-file-image' : 'fa-file-pdf'} fa-sm`}></i>
            <span className='fw-bold' style={{ fontSize: '11px' }}>{isImage ? 'IMAGE' : 'PDF CANVAS'}</span>
          </span>
          <div>
            <h6 className='fw-bold text-dark m-0' style={{ fontSize: '14px' }}>
              {title}
            </h6>
            <div className='text-muted font-monospace' style={{ fontSize: '11px' }} title={filename}>
              {filename.length > 40 ? `${filename.substring(0, 37)}...` : filename}
              {numPages && <span className='badge bg-secondary ms-2'>{numPages} page{numPages > 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>

        {showActions && (
          <div className='d-flex align-items-center gap-2'>
            {/* Contrôles de zoom */}
            <div className='btn-group btn-group-sm me-1' role='group'>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={() => isImage ? setImageZoom((z) => Math.min(z + 0.25, 2.5)) : setScale((s) => Math.min(s + 0.2, 2.0))}
                title='Zoomer'
              >
                <i className='fas fa-search-plus'></i>
              </button>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={() => isImage ? setImageZoom(1) : setScale(1.0)}
                title='Taille 100%'
              >
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  {Math.round((isImage ? imageZoom : scale) * 100)}%
                </span>
              </button>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={() => isImage ? setImageZoom((z) => Math.max(z - 0.25, 0.5)) : setScale((s) => Math.max(s - 0.2, 0.6))}
                title='Dézoomer'
              >
                <i className='fas fa-search-minus'></i>
              </button>
            </div>

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
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          overflow: 'auto',
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
                transform: `scale(${imageZoom})`,
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
        ) : !pdfError ? (
          <div
            className='w-100 d-flex flex-column align-items-center py-3'
            style={{ minHeight: '100%', backgroundColor: '#525659' }}
          >
            <Document
              file={resolvedUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPdfError(false);
              }}
              onLoadError={(err) => {
                console.error('Erreur de rendu react-pdf:', err);
                setPdfError(true);
              }}
              loading={
                <div className='p-5 text-center text-white'>
                  <div className='spinner-border text-light mb-3' role='status'></div>
                  <h6 className='fw-bold'>Chargement du document PDF...</h6>
                  <p className='small opacity-75'>Conversion et rendu haute définition en cours</p>
                </div>
              }
            >
              {numPages ? (
                Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className='mb-4'
                    style={{
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <Page
                      pageNumber={index + 1}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                    {numPages > 1 && (
                      <div className='text-center small text-muted py-1 bg-light border-top font-monospace'>
                        Page {index + 1} / {numPages}
                      </div>
                    )}
                  </div>
                ))
              ) : null}
            </Document>
          </div>
        ) : (
          /* Fallback iframe / direct card if canvas encounters an issue */
          <div className='p-5 text-center h-100 d-flex flex-column align-items-center justify-content-center bg-white'>
            <i className='fas fa-file-pdf text-danger fa-4x mb-3'></i>
            <h5 className='fw-bold text-dark'>{title}</h5>
            <p className='text-muted small mb-4' style={{ maxWidth: '420px' }}>
              Le document est prêt sur le serveur. Vous pouvez l'afficher directement en plein écran ou le télécharger sur votre poste.
            </p>
            <div className='d-flex gap-2 justify-content-center'>
              <a
                href={resolvedUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-primary fw-bold px-4 py-2'
              >
                <i className='fas fa-external-link-alt me-2'></i> Ouvrir le document PDF
              </a>
              <a
                href={resolvedUrl}
                download={filename}
                className='btn btn-outline-secondary fw-bold px-4 py-2'
              >
                <i className='fas fa-download me-2'></i> Télécharger
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
