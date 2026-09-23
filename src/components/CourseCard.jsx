import { Link } from 'react-router-dom'

const CourseCard = ({ id, logo, title, titleEn, description }) => {
  return (
    <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow items-center text-center">
        {/* Logo/Icon Section */}
        <div className="w-24 h-24 flex items-center justify-center mb-5 overflow-hidden">
          {logo ? (
            <img
              src={logo}
              alt={title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
          ) : null}
          <div className="text-5xl" style={{ display: logo ? 'none' : 'block' }}>📚</div>
        </div>

        {/* Course Title (Thai) */}
        <h3 className="text-xl font-bold text-navy mb-2 leading-snug">
          {title}
        </h3>

        {/* English Title */}
        <p className="text-sm font-medium text-gray-500 mb-4 tracking-wide">
          {titleEn}
        </p>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed flex-grow mb-5 line-clamp-3">
          {description}
        </p>

        {/* Divider Line */}
        <div className="w-full h-px bg-gray-200 mb-5"></div>

        {/* View Details Button */}
        <Link
          to={id ? `/courses/${id}` : '#'}
          className="text-pnru font-medium text-sm flex min-h-[44px] items-center justify-center gap-2 group hover:text-primary-dark transition-colors"
        >
          <span>ดูรายละเอียด</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default CourseCard
