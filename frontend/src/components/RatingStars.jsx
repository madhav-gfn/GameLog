import React from 'react';

export const RatingStars = ({ rating, onRate, interactive = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = React.useState(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(null)}
          className={`transition ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          disabled={!interactive}
        >
          <span
            className={`text-2xl ${(hoverRating || rating) >= star
                ? 'text-primary'
                : 'text-graphite'
              } transition`}
          >
            ★
          </span>
        </button>
      ))}
      {rating && (
        <span className="ml-2 text-sm text-gray-400">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
