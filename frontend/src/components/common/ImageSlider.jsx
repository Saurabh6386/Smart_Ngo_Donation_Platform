import { useState } from 'react';
import ImageModal from './ImageModal';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for popup

  // Safe check for images
  const safeImages = images && images.length > 0 ? images : null;

  if (!safeImages) {
    return (
      <div style={{ width: '100%', height: '200px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px' }}>
        No Image
      </div>
    );
  }

  const goToPrevious = (e) => {
    e.stopPropagation(); // Prevent opening modal when clicking arrows
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? safeImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e) => {
    e.stopPropagation(); // Prevent opening modal when clicking arrows
    const isLastSlide = currentIndex === safeImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <>
      <div style={sliderStyles}>
        {/* Show Arrows only if more than 1 image */}
        {safeImages.length > 1 && (
          <>
            <div style={leftArrowStyles} onClick={goToPrevious}>❮</div>
            <div style={rightArrowStyles} onClick={goToNext}>❯</div>
          </>
        )}

        {/* Main Image - Click to Open Modal */}
        <img 
          src={safeImages[currentIndex]} 
          alt="donation" 
          style={{ ...imageStyles, cursor: 'zoom-in' }} // Add zoom cursor
          onClick={() => setIsModalOpen(true)} // Open modal on click
        />

        {/* Page Indicator */}
        {safeImages.length > 1 && (
          <div style={dotsContainerStyles}>
            {currentIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Render Modal if Open */}
      {isModalOpen && (
        <ImageModal 
          image={safeImages[currentIndex]} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

// --- KEEP YOUR EXISTING STYLES BELOW ---
const sliderStyles = { position: 'relative', height: '200px', marginBottom: '10px' };
const imageStyles = { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' };
const arrowStyles = { position: 'absolute', top: '50%', transform: 'translate(0, -50%)', fontSize: '30px', color: 'white', zIndex: 1, cursor: 'pointer', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' };
const leftArrowStyles = { ...arrowStyles, left: '10px' };
const rightArrowStyles = { ...arrowStyles, right: '10px' };
const dotsContainerStyles = { position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' };

export default ImageSlider;