import React, { useState } from 'react';

export const ArticleCard = ({ article }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleTap = (e) => {
    // Prevent immediate navigation on mobile
    e.preventDefault();
    
    if (window.innerWidth <= 768) {
      setIsExpanded(!isExpanded);
      
      // If already expanded, then navigate to source
      if (isExpanded) {
        window.location.href = article.sourceUrl;
      }
    } else {
      // On desktop, navigate directly
      window.location.href = article.sourceUrl;
    }
  };

  return (
    <div 
      className="article-card relative"
      onClick={handleTap}
    >
      <div className="article-image">
        <img src={article.imageUrl} alt={article.title} />
      </div>
      
      {/* Show preview on mobile first tap */}
      {(isExpanded || window.innerWidth > 768) && (
        <div className="article-preview p-4 bg-black bg-opacity-75 absolute bottom-0 left-0 right-0">
          <h3 className="text-white text-lg font-bold">{article.title}</h3>
          <p className="text-gray-200 mt-2">{article.preview}</p>
          {isExpanded && (
            <button className="mt-2 text-blue-400">
              Tap again to read full article →
            </button>
          )}
        </div>
      )}
    </div>
  );
};