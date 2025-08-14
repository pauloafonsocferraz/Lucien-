import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = null, 
  className = "",
  color = 'primary'
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium', 
    large: 'spinner-large'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${color} ${className}`}>
      <div className="spinner-circle" />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
