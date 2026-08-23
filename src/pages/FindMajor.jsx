import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Users, Venus, Mars, Check } from 'lucide-react'

const FindMajor = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTrack, setSelectedTrack] = useState('')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])

  const steps = [
    { id: 1, title: 'ข้อมูลพื้นฐาน', status: 'current' },
    { id: 2, title: 'ความสนใจ', status: 'pending' },
    { id: 3, title: 'ความถนัด', status: 'pending' },
    { id: 4, title: 'เป้าหมายอาชีพ', status: 'pending' },
    { id: 5, title: 'ผลลัพธ์', status: 'pending' }
  ]

  const tracks = [
    { id: 'sci-math', label: 'วิทย์-คณิต' },
    { id: 'art-cal', label: 'ศิลป์-คำนวณ' },
    { id: 'art-lang', label: 'ศิลป์-ภาษา' },
    { id: 'voc', label: 'ปวช-ปวส' },
    { id: 'other', label: 'อื่นๆ' }
  ]

  const subjects = [
    'คณิตศาสตร์', 'คอมพิวเตอร์', 'ฟิสิกส์', 'เคมี',
    'ชีววิทยา', 'ศิลปะ', 'คหกรรม', 'เกษตร',
    'สุขศึกษา', 'ภาษา', 'สังคมศึกษา', 'อื่นๆ'
  ]

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const handleNext = () => {
    // Validation
    if (!selectedTrack) {
      alert('กรุณาเลือกสายการเรียน')
      return
    }
    if (!selectedGender) {
      alert('กรุณาเลือกเพศ')
      return
    }
    if (selectedSubjects.length === 0) {
      alert('กรุณาเลือกวิชาที่ชอบอย่างน้อย 1 วิชา')
      return
    }

    // Save data and move to next step
    console.log('Form data:', { selectedTrack, selectedGender, selectedSubjects })
    navigate('/find-major/step2')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Steps */}
          <aside className="lg:col-span-3">
            <div className="bg-[#E8F5F1] rounded-xl lg:rounded-2xl p-4 lg:p-6 lg:sticky lg:top-28">
              <h2 className="text-xl lg:text-2xl font-bold text-pnru mb-2">
                ค้นหาสาขาที่เหมาะกับคุณ
              </h2>
              <p className="text-xs lg:text-sm text-gray-600 mb-4 lg:mb-6">
                ตอบแบบสอบถามสั้น ๆ เพื่อค้นหาสาขาที่ใช่สำหรับคุณ
              </p>

              {/* Steps List */}
              <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start">
                    <div className="flex flex-col items-center mr-3">
                      <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-medium text-xs lg:text-sm ${
                        step.status === 'current'
                          ? 'bg-pnru text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.id}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-6 lg:h-8 bg-gray-300 my-1"></div>
                      )}
                    </div>
                    <div className="pt-0.5 lg:pt-1">
                      <p className={`text-sm lg:text-base font-medium ${
                        step.status === 'current' ? 'text-pnru' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.status === 'current' ? 'กำลังทำ' : 'ยังไม่ได้ทำ'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200">
                <p className="text-xs lg:text-sm text-gray-700 mb-1">
                  <span className="inline-block mr-1">⏱️</span>
                  ใช้เวลาประมาณ 3-5 นาที
                </p>
                <p className="text-xs lg:text-sm text-gray-600">
                  เพื่อผลลัพธ์ที่แม่นยำยิ่งขึ้น
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content - Questions as separate cards */}
          <main className="lg:col-span-6 space-y-5 lg:space-y-6">
            {/* Progress Header */}
            <div className="mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-pnru mb-1">ข้อมูลพื้นฐาน</h1>
              <p className="text-xs lg:text-sm text-gray-500 mb-3">ขั้นตอนที่ 1 จาก 5</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-pnru h-2 rounded-full transition-all duration-300" style={{ width: '20%' }}></div>
                </div>
                <span className="text-sm font-medium text-pnru">20%</span>
              </div>
            </div>

            {/* Card 1: Track Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 pt-0.5">
                  ตอนนี้คุณเรียนสายอะไรอยู่?
                </h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {tracks.map(track => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track.id)}
                    aria-selected={selectedTrack === track.id}
                    className={`relative px-3 py-2.5 lg:py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 flex items-center justify-center ${
                      selectedTrack === track.id
                        ? 'border-pnru bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Checkmark Badge */}
                    {selectedTrack === track.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-pnru rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <p className="font-medium text-sm lg:text-base text-gray-800 whitespace-nowrap">{track.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 2: Gender Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 pt-0.5">
                  เพศของคุณ
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'male', label: 'ชาย', icon: Mars },
                  { id: 'female', label: 'หญิง', icon: Venus },
                  { id: 'other', label: 'ไม่ต้องการระบุ', icon: User }
                ].map(gender => {
                  const IconComponent = gender.icon
                  return (
                    <button
                      key={gender.id}
                      onClick={() => setSelectedGender(gender.label)}
                      aria-selected={selectedGender === gender.label}
                      className={`relative px-4 py-3 lg:py-3.5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 ${
                        selectedGender === gender.label
                          ? 'border-pnru bg-green-50 text-pnru font-medium'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {/* Checkmark Badge */}
                      {selectedGender === gender.label && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-pnru rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        <IconComponent
                          className={`w-5 h-5 ${
                            selectedGender === gender.label ? 'text-pnru' : 'text-gray-600'
                          }`}
                          strokeWidth={2}
                        />
                        <span className="whitespace-nowrap">{gender.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card 3: Subject Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 inline">
                    คุณชอบวิชาอะไรมากที่สุด?
                  </h3>
                  <span className="text-sm text-gray-500 mt-1 ml-2">(เลือกได้มากกว่า 1 ข้อ)</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    aria-selected={selectedSubjects.includes(subject)}
                    className={`relative px-3 py-2 lg:py-2.5 rounded-lg border-2 transition-all duration-200 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 ${
                      selectedSubjects.includes(subject)
                        ? 'border-pnru bg-green-50 text-pnru font-medium'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {/* Checkmark Badge */}
                    {selectedSubjects.includes(subject) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-pnru rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <span className="flex items-center justify-center whitespace-nowrap pr-4">
                      {subject}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-pnru text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg font-medium hover:bg-opacity-90 transition focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 flex items-center gap-2 shadow-sm"
              >
                ถัดไป
                <span className="text-lg">→</span>
              </button>
            </div>
          </main>

          {/* Right Sidebar - Tips */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm lg:sticky lg:top-28">
              <div className="flex items-center gap-2 mb-3 lg:mb-4">
                <span className="text-xl lg:text-2xl">⭐</span>
                <h3 className="text-base lg:text-lg font-bold text-gray-800">เคล็ดลับ</h3>
              </div>
              <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4 leading-relaxed">
                ตอบคำถามตามความสนใจและตัวตนที่แท้จริงของคุณ
                จะช่วยให้ระบบแนะนำสาขาที่เหมาะสมกับคุณได้ดีที่สุด
              </p>
              <div className="bg-[#E8F5F1] rounded-lg p-3 lg:p-4">
                <p className="text-xs lg:text-sm text-pnru font-medium leading-relaxed">
                  ไม่มีคำตอบที่ถูกหรือผิด<br />
                  ทุกความสนใจของคุณมีคุณค่าเสมอ
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default FindMajor
