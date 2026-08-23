import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Laptop,
  Microscope,
  Heart,
  Leaf,
  Utensils,
  Wheat,
  Settings,
  Lightbulb,
  Check
} from 'lucide-react'

const FindMajorStep2 = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(2)
  const [selectedInterests, setSelectedInterests] = useState([])

  const steps = [
    { id: 1, title: 'ข้อมูลพื้นฐาน', status: 'completed' },
    { id: 2, title: 'ความสนใจ', status: 'current' },
    { id: 3, title: 'ความถนัด', status: 'pending' },
    { id: 4, title: 'เป้าหมายอาชีพ', status: 'pending' },
    { id: 5, title: 'ผลลัพธ์', status: 'pending' }
  ]

  const interests = [
    { id: 'tech', label: 'เทคโนโลยีและคอมพิวเตอร์', icon: Laptop },
    { id: 'science', label: 'วิทยาศาสตร์และการทดลอง', icon: Microscope },
    { id: 'health', label: 'คณิตศาสตร์และการวิเคราะห์', icon: Heart },
    { id: 'environment', label: 'ธุรกิจและการจัดการ', icon: Leaf },
    { id: 'food', label: 'เกษตรและสิ่งแวดล้อม', icon: Utensils },
    { id: 'agriculture', label: 'อาหารและโภชนาการ', icon: Wheat },
    { id: 'industry', label: 'การออกแบบและสื่อสร้างสรรค์', icon: Settings },
    { id: 'innovation', label: 'สุขภาพและการแพทย์', icon: Lightbulb }
  ]

  const handleInterestToggle = (interestId) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    )
  }

  const handleNext = () => {
    if (selectedInterests.length === 0) {
      alert('กรุณาเลือกความสนใจอย่างน้อย 1 ข้อ')
      return
    }

    console.log('Selected interests:', selectedInterests)
    navigate('/find-major/step3')
  }

  const handleBack = () => {
    navigate('/find-major')
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
                        step.status === 'completed'
                          ? 'bg-pnru text-white'
                          : step.status === 'current'
                          ? 'bg-pnru text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.status === 'completed' ? '✓' : step.id}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-6 lg:h-8 bg-gray-300 my-1"></div>
                      )}
                    </div>
                    <div className="pt-0.5 lg:pt-1">
                      <p className={`text-sm lg:text-base font-medium ${
                        step.status === 'current' ? 'text-pnru' : step.status === 'completed' ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.status === 'current' ? 'กำลังทำ' : step.status === 'completed' ? 'เสร็จแล้ว' : 'ยังไม่ได้ทำ'}
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

          {/* Main Content - Interests */}
          <main className="lg:col-span-6 space-y-5 lg:space-y-6">
            {/* Progress Header */}
            <div className="mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-pnru mb-1">ความสนใจ</h1>
              <p className="text-xs lg:text-sm text-gray-500 mb-3">ขั้นตอนที่ 2 จาก 5</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-pnru h-2 rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
                </div>
                <span className="text-sm font-medium text-pnru">40%</span>
              </div>
            </div>

            {/* Card: Interests Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 inline">
                    คุณสนใจด้านใดบ้าง?
                  </h3>
                  <span className="text-sm text-gray-500 ml-2">(เลือกได้มากกว่า 1 ข้อ)</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {interests.map(interest => {
                  const IconComponent = interest.icon
                  return (
                    <button
                      key={interest.id}
                      onClick={() => handleInterestToggle(interest.id)}
                      aria-selected={selectedInterests.includes(interest.id)}
                      className={`relative p-4 lg:p-5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 ${
                        selectedInterests.includes(interest.id)
                          ? 'border-pnru bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkmark Badge */}
                      {selectedInterests.includes(interest.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-pnru rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <IconComponent
                          className={`w-10 h-10 lg:w-12 lg:h-12 ${
                            selectedInterests.includes(interest.id)
                              ? 'text-pnru'
                              : 'text-gray-600'
                          }`}
                          strokeWidth={1.5}
                        />
                        <p className="font-medium text-sm lg:text-base text-gray-800 text-center leading-tight">
                          {interest.label}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="bg-white border-2 border-gray-300 text-gray-700 px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg font-medium hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center gap-2 shadow-sm"
              >
                <span className="text-lg">←</span>
                ย้อนกลับ
              </button>
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
                เลือกด้านที่คุณสนใจจริง ๆ
                ไม่ว่าจะเป็นความชอบส่วนตัวหรือสิ่งที่อยากเรียนรู้
              </p>
              <div className="bg-[#E8F5F1] rounded-lg p-3 lg:p-4">
                <p className="text-xs lg:text-sm text-pnru font-medium leading-relaxed">
                  สนใจหลายด้านก็ไม่เป็นไร<br />
                  เราจะช่วยหาสาขาที่ผสมผสานความสนใจของคุณ
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default FindMajorStep2
