const CourseCard = ({ id, logo, title, titleEn, description }) => {
  return (
    <div className="min-w-[300px] max-w-[320px] bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow items-center text-center">
        {/* Logo/Icon Section */}
        <div className="w-24 h-24 flex items-center justify-center mb-5 overflow-hidden">
          <img
            src={logo}
            alt={title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<div class="text-5xl">📚</div>'
            }}
          />
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
        <p className="text-gray-600 text-sm leading-relaxed flex-grow mb-5">
          {description}
        </p>

        {/* Divider Line */}
        <div className="w-full h-px bg-gray-200 mb-5"></div>

        {/* View Details Button */}
        <a
          href={id ? `/courses/${id}` : '#'}
          className="text-pnru font-medium text-sm flex items-center justify-center gap-2 group hover:text-primary-dark transition-colors"
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
        </a>
      </div>
    </div>
  )
}

export default CourseCard
