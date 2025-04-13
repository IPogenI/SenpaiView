import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRate, userRating }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate(star)}
                    className={`${star <= userRating ? 'text-yellow-400' : 'text-gray-400'
                        } hover:text-yellow-400 transition-colors`}
                >
                    <Star size={20} fill={star <= userRating ? 'currentColor' : 'none'} />
                </button>
            ))}
        </div>
    );
};

export default StarRating; 