import React, { useState } from 'react';
import { useReviews } from '../hooks/useReviews';

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
        <form onSubmit={handleSubmit} className="bg-graphite/30 border-2 border-graphite rounded p-4 space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wider">Write a Review</h4>

            {error && <div className="text-crimson text-sm font-bold">{error}</div>}

            <div>
                <label className="block text-sm mb-1 text-gray-400 font-bold uppercase tracking-wider">Rating</label>
                <select
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full p-2 rounded bg-navy border-2 border-graphite text-white font-bold focus:outline-none focus:border-primary transition-colors"
                >
                    <option value="0">Select Rating</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm mb-1 text-gray-400 font-bold uppercase tracking-wider">Review</label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full p-2 h-24 rounded bg-navy border-2 border-graphite text-white resize-none focus:outline-none focus:border-primary transition-colors placeholder-gray-600"
                    placeholder="What did you think?"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-primary text-navy px-6 py-2 rounded font-bold uppercase tracking-wider hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
                {loading ? 'Posting...' : 'Post Review'}
            </button>
        </form>
    );
};
