import { useState } from 'react'
import Spinner from './Spinner'

export default function RatingModal({ isOpen, onClose, onSubmit, title = "Rate Service", loading = false }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [feedback, setFeedback] = useState('')

  if (!isOpen) return null

  const handleRating = (val) => {
    setRating(val)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) return
    onSubmit({ rating, feedback })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 relative animate-slide-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 text-sm mb-6">Your feedback helps us improve the Fixngo experience.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="text-4xl transition-transform hover:scale-110 active:scale-95"
                >
                  <span className={star <= (hover || rating) ? "text-yellow-400" : "text-slate-700"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-brand-400">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          <div>
            <label className="form-label mb-2 block">Tell us more (optional)</label>
            <textarea
              className="form-input min-h-[100px] resize-none"
              placeholder="How was your experience?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || loading}
              className="btn-primary flex-1"
            >
              {loading ? <Spinner size="sm" /> : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
