'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Trash2, Star } from 'lucide-react';
import {
  deleteReview as deleteReviewRequest,
  fetchReviews as fetchReviewsRequest,
  updateReviewApproval
} from '@/lib/api';

const filterLabels = {
  all: 'সব',
  approved: 'অনুমোদিত',
  pending: 'অপেক্ষমাণ',
} as const;

interface Review {
  id: string;
  book_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  book_title?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  async function fetchReviews() {
    setIsLoading(true);
    try {
      const { data } = await fetchReviewsRequest(filter);
      setReviews(
        data.map(review => ({
          ...review,
          book_title: review.book_title ?? undefined
        }))
      );
    } catch (err) {
      setMessage({ type: 'error', text: 'রিভিউ লোড করতে ব্যর্থ হয়েছি' });
    } finally {
      setIsLoading(false);
    }
  }

  async function approveReview(id: string) {
    try {
      await updateReviewApproval(id, true);

      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));
      setMessage({ type: 'success', text: 'রিভিউ অনুমোদিত হয়েছে!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'রিভিউ অনুমোদন করা যায়নি' });
    }
  }

  async function deleteReview(id: string) {
    try {
      await deleteReviewRequest(id);

      setReviews(prev => prev.filter(r => r.id !== id));
      setMessage({ type: 'success', text: 'রিভিউ মুছে ফেলা হয়েছে!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'রিভিউ মুছে ফেলতে ব্যর্থ হয়েছি' });
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-[#2D1B4E] mb-8">রিভিউ ব্যবস্থাপনা</h2>

      {message && (
        <motion.div
          className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 border-l-4 border-green-500'
              : 'bg-red-50 border-l-4 border-red-500'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message.type === 'success' ? (
            <CheckCircle className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </motion.div>
      )}

      <div className="flex gap-4 mb-6">
        {(['all', 'approved', 'pending'] as const).map(f => (
          <motion.button
            key={f}
            onClick={() => {
              setFilter(f);
              setIsLoading(true);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-[#884be3] text-white'
                : 'bg-white text-[#6B4BA8] hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filterLabels[f]}
          </motion.button>
        ))}
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#2D1B4E]">{review.reviewer_name}</h3>
                  <p className="text-sm text-[#6B4BA8]">
                    {new Date(review.created_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(review.rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-sm font-medium text-[#2D1B4E]">
                    {review.rating.toLocaleString('bn-BD', { maximumFractionDigits: 1 })}
                  </span>
                </div>
              </div>

              <p className="text-[#6B4BA8] mb-4">{review.comment}</p>

              <div className="flex items-center justify-between">
                <div>
                  {review.is_approved ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle size={16} />
                      অনুমোদিত
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      <AlertCircle size={16} />
                      অপেক্ষমাণ
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {!review.is_approved && (
                    <motion.button
                      onClick={() => approveReview(review.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      অনুমোদন করুন
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => deleteReview(review.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={16} />
                    মুছে ফেলুন
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-[#6B4BA8]">কোনো রিভিউ পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
