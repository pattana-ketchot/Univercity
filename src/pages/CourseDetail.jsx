import { useState } from 'react'
import {
  Clock,
  Globe,
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Lightbulb,
  GraduationCap,
  FileText,
  DollarSign
} from 'lucide-react'

const CourseDetail = () => {
  const [activeTab, setActiveTab] = useState('details')

  // Course Data
  const courseData = {
    title: 'คอมพิวเตอร์แอนิเมชันและมัลติมีเดีย',
    titleEn: 'Computer Animation and Multimedia',
    level: 'ปริญญาตรี',
    image: '/assets/courses/animation.png',
    description: 'หลักสูตรที่ผสมผสานความรู้ด้านคอมพิวเตอร์กราฟิกส์ แอนิเมชัน และมัลติมีเดีย เพื่อสร้างสรรค์งานดิจิทัลคอนเทนต์ที่ทันสมัย',
    duration: '4 ปี',
    type: 'ภาคปกติ',
    language: 'ภาษาไทย',

    // Important Information for Sidebar
    importantInfo: [
      { label: 'ระดับการศึกษา', value: 'Bachelor', icon: GraduationCap },
      { label: 'ค่าเล่าเรียน', value: '12,000 บาท/ภาคการศึกษา', icon: DollarSign },
      { label: 'ค่าเล่าเรียนตลอดหลักสูตร', value: '~ 96,000 บาท', icon: DollarSign },
    ],

    // About Section
    about: `หลักสูตรคอมพิวเตอร์แอนิเมชันและมัลติมีเดียเป็นหลักสูตรที่ออกแบบมาเพื่อสร้างบุคลากรที่มีความเชี่ยวชาญด้านการสร้างสรรค์งานแอนิเมชัน คอมพิวเตอร์กราฟิกส์ และสื่อดิจิทัลในรูปแบบต่าง ๆ นักศึกษาจะได้เรียนรู้ทั้งทฤษฎีและปฏิบัติด้านการออกแบบ การสร้างสรรค์ และการผลิตงานมัลติมีเดียที่มีคุณภาพ พร้อมทั้งฝึกทักษะการใช้เทคโนโลยีและซอฟต์แวร์ที่ทันสมัย`,

    // Highlights
    highlights: [
      'เรียนรู้เทคนิคการสร้างแอนิเมชัน 2D และ 3D',
      'ฝึกปฏิบัติกับซอฟต์แวร์มาตรฐานอุตสาหกรรม',
      'พัฒนาทักษะด้าน Visual Effects และ Motion Graphics',
      'เรียนรู้การออกแบบประสบการณ์ผู้ใช้ (UX/UI)',
      'โอกาสฝึกงานกับบริษัทชั้นนำในอุตสาหกรรม',
      'อาจารย์ผู้สอนมีประสบการณ์จากงานจริง'
    ],

    // What You'll Learn
    curriculum: [
      {
        title: 'คอมพิวเตอร์กราฟิกส์และแอนิเมชัน',
        items: ['2D Animation', '3D Modeling & Animation', 'Character Design', 'Storyboarding']
      },
      {
        title: 'มัลติมีเดียและการผลิตเนื้อหา',
        items: ['Video Production', 'Audio Production', 'Interactive Media', 'Digital Photography']
      },
      {
        title: 'เทคโนโลยีและเครื่องมือ',
        items: ['Adobe Creative Suite', 'Autodesk Maya', 'Blender', 'Unity/Unreal Engine']
      },
      {
        title: 'การออกแบบและพัฒนา',
        items: ['UI/UX Design', 'Game Design', 'Web Design', 'Mobile Application Design']
      }
    ],

    // Faculty (placeholder data)
    faculty: [
      { name: 'ผศ.ดร. สมชาย ใจดี', expertise: 'Computer Graphics', image: null },
      { name: 'อ.สมหญิง รักการสอน', expertise: '3D Animation', image: null },
      { name: 'ผศ. นพดล เก่งเทคโน', expertise: 'Game Development', image: null }
    ],

    // Documents
    documents: [
      { name: 'โครงสร้างหลักสูตร', size: '2.5 MB', type: 'PDF' },
      { name: 'รายละเอียดวิชาเรียน', size: '1.8 MB', type: 'PDF' },
      { name: 'แผนการเรียน', size: '950 KB', type: 'PDF' }
    ]
  }

  const tabs = [
    { id: 'details', label: 'รายละเอียดหลักสูตร' },
    { id: 'documents', label: 'เอกสารหลักสูตร' },
    { id: 'faculty', label: 'คณาจารย์' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Layout: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Main Content - Left Side (70-75%) */}
          <div className="lg:col-span-8">

            {/* Course Header - Horizontal Card */}
            <div className="bg-gray-50 rounded-xl overflow-hidden mb-6">
              <div className="flex flex-col md:flex-row">

                {/* Left Side - Logo/Image */}
                <div className="w-full md:w-64 lg:w-80 flex-shrink-0 bg-gray-50 flex items-center justify-center p-8 md:p-10">
                  <div className="relative">
                    <img
                      src={courseData.image}
                      alt={courseData.title}
                      className="w-40 h-40 lg:w-48 lg:h-48 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<div class="text-6xl lg:text-7xl">🎨</div>'
                      }}
                    />
                  </div>
                </div>

                {/* Right Side - Course Information */}
                <div className="flex-1 p-6 lg:p-8">

                  {/* Line 1: Title + Badge */}
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex-1 min-w-0">
                      {courseData.title}
                    </h1>
                    <span className="bg-green-50 text-pnru text-sm font-semibold px-4 py-1.5 rounded-full border border-green-200 flex-shrink-0">
                      {courseData.level}
                    </span>
                  </div>

                  {/* Line 2: English Title */}
                  <p className="text-base lg:text-lg text-gray-500 mb-4 font-medium">
                    {courseData.titleEn}
                  </p>

                  {/* Line 3: Description */}
                  <p className="text-gray-700 leading-relaxed mb-5 text-sm lg:text-base">
                    {courseData.description}
                  </p>

                  {/* Line 4: Metadata Icons (Single Row) */}
                  <div className="flex flex-wrap items-center gap-5 lg:gap-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5 text-pnru flex-shrink-0" />
                      <span className="text-sm font-medium">{courseData.duration}การศึกษา</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="w-5 h-5 text-pnru flex-shrink-0" />
                      <span className="text-sm font-medium">{courseData.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-5 h-5 text-pnru flex-shrink-0" />
                      <span className="text-sm font-medium">{courseData.language}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-50 rounded-xl mb-6">
              <div className="border-gray-200">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-6 py-4 text-sm font-semibold transition-colors relative ${
                        activeTab === tab.id
                          ? 'text-pnru'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pnru"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div className="space-y-6">

                {/* About Section */}
                <div className="bg-gray-50 rounded-xl p-6 lg:p-8">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-green-100 rounded-lg p-2">
                      <BookOpen className="w-6 h-6 text-pnru" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">เกี่ยวกับสาขา</h2>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {courseData.about}
                  </p>
                </div>

                {/* Highlights Section */}
                <div className="bg-gray-50 rounded-xl p-6 lg:p-8">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="bg-yellow-100 rounded-lg p-2">
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">จุดเด่นของสาขา</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-pnru flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum Section */}
                <div className="bg-gray-50 rounded-xl p-6 lg:p-8">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">เรียนอะไรบ้าง</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courseData.curriculum.map((category, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                          {category.title}
                        </h3>
                        <ul className="space-y-2">
                          {category.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-pnru mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-gray-50 rounded-xl shadow-sm p-6 lg:p-8">
                <div className="flex items-start gap-3 mb-6">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">เอกสารหลักสูตร</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {courseData.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 rounded-lg p-2">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <button className="text-pnru hover:text-green-700 font-medium text-sm">
                        ดาวน์โหลด
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faculty' && (
              <div className="bg-gray-50 rounded-xl shadow-sm p-6 lg:p-8">
                <div className="flex items-start gap-3 mb-6">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">คณาจารย์</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courseData.faculty.map((teacher, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-5 text-center hover:shadow-md transition-shadow"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{teacher.name}</h3>
                      <p className="text-sm text-gray-600">{teacher.expertise}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar - Right Side (25-30%) */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-24">

              {/* Sidebar Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="bg-green-100 rounded-lg p-1.5">
                    <FileText className="w-5 h-5 text-pnru" />
                  </div>
                  ข้อมูลสำคัญ
                </h3>
              </div>

              {/* Important Information List */}
              <div className="space-y-4">
                {courseData.importantInfo.map((info, index) => (
                  <div
                    key={index}
                    className="pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 rounded-lg p-2 flex-shrink-0">
                        <info.icon className="w-5 h-5 text-pnru" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {info.label}
                        </p>
                        <p className="text-base font-semibold text-gray-900 break-words">
                          {info.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-pnru hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  สมัครเรียน
                </button>
                <button className="w-full mt-3 border-2 border-pnru text-pnru hover:bg-green-50 font-semibold py-3 px-4 rounded-lg transition-colors">
                  ติดต่อสอบถาม
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}

export default CourseDetail
