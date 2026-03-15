interface Review {
  author: string;
  rating: number;
  text: string;
  source?: string;
}

interface GoogleReviewsProps {
  title?: string;
  reviews: Review[];
  speed?: number;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-yellow-400 text-lg tracking-tight">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

export function GoogleReviews({ title, reviews, speed = 35 }: GoogleReviewsProps) {
  const doubled = [...reviews, ...reviews];

  return (
    <section className="w-full py-12 sm:py-16 bg-gray-50 overflow-x-clip">
      {title && (
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-sm text-gray-500">Verifizierte Google Bewertungen</span>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden" style={{ contain: 'paint' }}>
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-6 w-max will-change-transform"
          style={{
            animation: `reviewScroll ${speed}s linear infinite`,
          }}
        >
          {doubled.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 sm:w-96 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3"
            >
              <Stars count={review.rating} />
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-5">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-auto pt-2 border-t border-gray-50">
                <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                {review.source && (
                  <p className="text-xs text-gray-400">{review.source}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes reviewScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
