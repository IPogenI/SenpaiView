import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const RatingSystem = ({ animeId, userId }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [allRatings, setAllRatings] = useState([]);
    const [stats, setStats] = useState({ totalRatings: 0, averageRating: 0 });

    // Fetch existing ratings
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const [animeRatings, userRating] = await Promise.all([
                    axios.get(`http://localhost:8000/api/ratings/anime/${animeId}`),
                    userId ? axios.get(`http://localhost:8000/api/ratings/anime/${animeId}/user/${userId}`) : Promise.resolve({ data: null })
                ]);

                setAllRatings(animeRatings.data.ratings);
                setStats(animeRatings.data.stats);

                if (userRating.data) {
                    setRating(userRating.data.rating);
                    setReview(userRating.data.review || '');
                } else {
                    setRating(0);
                    setReview('');
                }
            } catch (error) {
                console.error('Error fetching ratings:', error);
                setAllRatings([]);
                setStats({ totalRatings: 0, averageRating: 0 });
            }
        };

        fetchRatings();
    }, [animeId, userId]);

    const handleRatingSubmit = async () => {
        if (!userId) {
            console.error('User must be logged in to rate');
            return;
        }

        if (!rating) {
            console.error('Please select a rating');
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/ratings', {
                animeId,
                userId,
                rating,
                review
            });

            // Refresh ratings after submission
            const response = await axios.get(`http://localhost:8000/api/ratings/anime/${animeId}`);
            setAllRatings(response.data.ratings);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    return (
        <div className="rating-system">
            <div className="rating-input">
                <div className="stars">
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                    style={{ display: 'none' }}
                                />
                                <FaStar
                                    className="star"
                                    size={24}
                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                    style={{ cursor: 'pointer' }}
                                />
                            </label>
                        );
                    })}
                </div>
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your review (optional)"
                    maxLength={1000}
                    className="review-input"
                />
                <button onClick={handleRatingSubmit} className="submit-rating">
                    Submit Rating
                </button>
            </div>

            <div className="rating-stats">
                <p>Average Rating: {stats.averageRating} ⭐ ({stats.totalRatings} ratings)</p>
            </div>

            <div className="rating-list">
                <h3>Recent Reviews</h3>
                {allRatings.map((r) => (
                    <div key={r._id} className="review-item">
                        <div className="review-header">
                            <span className="rating-value">{'⭐'.repeat(r.rating)}</span>
                            <span className="review-date">
                                {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {r.review && <p className="review-text">{r.review}</p>}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .rating-system {
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .rating-input {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .stars {
                    display: flex;
                    gap: 5px;
                }

                .review-input {
                    width: 100%;
                    min-height: 100px;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    resize: vertical;
                }

                .submit-rating {
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    align-self: flex-start;
                }

                .submit-rating:hover {
                    background-color: #45a049;
                }

                .rating-stats {
                    margin: 20px 0;
                    padding: 10px;
                    background-color: #f5f5f5;
                    border-radius: 4px;
                }

                .rating-list {
                    margin-top: 20px;
                }

                .review-item {
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                }

                .review-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .review-date {
                    color: #666;
                    font-size: 0.9em;
                }

                .review-text {
                    color: #333;
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
};

export default RatingSystem;
