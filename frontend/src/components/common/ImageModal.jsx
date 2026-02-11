const ImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={contentStyles} onClick={(e) => e.stopPropagation()}>
        <span style={closeButtonStyles} onClick={onClose}>&times;</span>
        <img src={image} alt="Full Screen" style={imageStyles} />
      </div>
    </div>
  );
};

// --- STYLES ---
const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark background
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000, // On top of everything
  cursor: 'zoom-out'
};

const contentStyles = {
  position: 'relative',
  maxWidth: '90%',
  maxHeight: '90%',
};

const imageStyles = {
  width: '100%',
  height: 'auto',
  maxHeight: '85vh',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
};

const closeButtonStyles = {
  position: 'absolute',
  top: '-40px',
  right: '0',
  color: 'white',
  fontSize: '40px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default ImageModal;