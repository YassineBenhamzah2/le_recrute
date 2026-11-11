import React from 'react';
import { getFileUrl } from '../utils/fileUrl';

const LInkFichier = ({ link, label = 'Télécharger' }) => {
  const resolvedUrl = getFileUrl(link);
  return (
    <div>
      <a
        href={resolvedUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='badge bg-primary text-decoration-none p-2'
      >
        <i className='fas fa-file-pdf me-1'></i> {label}
      </a>
    </div>
  );
};

export default LInkFichier;

