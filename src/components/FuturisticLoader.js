import React from 'react';

const FuturisticLoader = ({ message = "Loading data..." }) => {
  return (
    <div className="futuristic-loader-container">
      <div className="futuristic-loader">
        <div className="loader-ring outer-ring"></div>
        <div className="loader-ring middle-ring"></div>
        <div className="loader-ring inner-ring"></div>
        <div className="loader-glow"></div>
        <div className="loader-lines">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="loader-line" style={{ transform: `rotate(${i * 45}deg)` }}></div>
          ))}
        </div>
      </div>
      <div className="futuristic-loader-text">{message}</div>
      <div className="data-dots">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="data-dot" style={{ animationDelay: `${i * 0.2}s` }}></div>
        ))}
      </div>
    </div>
  );
};

export default FuturisticLoader; 