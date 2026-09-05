import { Link } from 'react-router-dom'
import Reveal from './Reveal'

// Shared news card used by both the homepage widget (SciConnectNews) and the
// full listing page (SciConnectAll), so the two stay visually consistent.
const SciConnectCard = ({ item, index = 0 }) => {
  return (
    <Reveal
      as="div"
      direction="left"
      delay={index * 80}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="w-full h-48 bg-gray-200 overflow-hidden">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-navy mb-3 leading-snug line-clamp-2">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed flex-grow mb-4 line-clamp-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{item.published_date}</span>
          {item.slug && (
            <Link to={`/sci-connect/${item.slug}`} className="text-pnru font-medium text-sm hover:underline">
              อ่านต่อ →
            </Link>
          )}
        </div>
      </div>
    </Reveal>
  )
}

export default SciConnectCard
