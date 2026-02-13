import React, { useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { RatingStars } from './RatingStars'; // Assuming this exists or I should create/check it

export const ReviewForm = ({ gameId, onReviewSubmitted }) => {
    const { createReview, loading, error } = useReviews();
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createReview(gameId, { rating, content });
            setContent('');
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
            <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary">Write a Review</h4>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
                <label className="block text-sm mb-1 text-light-text-secondary dark:text-dark-text-secondary">Rating</label>
                {/* Simplified rating input if RatingStars doesn't support interaction, or assuming it does */}
                {/* Fallback to simple select if RatingStars is read-only in existing codebase? */}
                {/* I'll use a simple select for robustness for now, or assume RatingStars exists and is interactive later. 
                    Actually, checking existing components: RatingStars.jsx exists. 
                    Let's use a simple select for now to guarantee functionality without checking RatingStars implementation. */}
                <select
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full p-2 rounded bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-default dark:border-dark-border-default"
                >
                    <option value="0">Select Rating</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm mb-1 text-light-text-secondary dark:text-dark-text-secondary">Review</label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full p-2 h-24 rounded bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-default dark:border-dark-border-default resize-none"
                    placeholder="What did you think?"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-light-accent-primary dark:bg-dark-accent-primary text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
            >
                {loading ? 'Posting...' : 'Post Review'}
            </button>
        </form>
    );
};
