import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calculator,
  Code,
  Paintbrush,
  Users,
  BookOpen,
  Wrench,
  LineChart,
  MessageSquare
} from 'lucide-react'
import { saveFindMajorAnswers } from '../lib/findMajorAnswers'

const FindMajorStep3 = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(3)
  const [selectedSkills, setSelectedSkills] = useState([])

  const steps = [
    { id: 1, title: 'ข้อมูลพื้นฐาน', status: 'completed' },
    { id: 2, title: 'ความสนใจ', status: 'completed' },
    { id: 3, title: 'ความถนัด', status: 'current' },
    { id: 4, title: 'เป้าหมายอาชีพ', status: 'pending' },
    { id: 5, title: 'ผลลัพธ์', status: 'pending' }
  ]

  const skills = [
    { id: 'math', label: 'วิเคราะห์ แยกแยะและหาสาเหตุของปัญหา', icon: Calculator },
    { id: 'programming', label: 'ตัวเลข การคิดคำนวนและการแก้โจทย์ปัญหา', icon: Code },
    { id: 'creative', label: 'ชอบเขียนโค้ด พัฒนาโปรแกรม', icon: Paintbrush },
    { id: 'teamwork', label: 'การเขียน เรียบเรียงและสื่อสารความคิด', icon: Users },
    { id: 'research', label: 'ทดลอง สังเกตและค้นหาคำตอบด้วยตัวเอง', icon: BookOpen },
    { id: 'practical', label: 'คิดไอเดียใหม่ๆออกแบบสร้างสรรค์ผลงาน', icon: Wrench },
    { id: 'analysis', label: 'การทำงานเป็นทีม ประสานงานและช่วยเหลือผู้อื่น', icon: LineChart },
    { id: 'communication', label: 'การพูด นำเสนอข้อมูลต่อหน้าคนหมู่มาก', icon: MessageSquare }
  ]

  // เก็บ label ที่ผู้ใช้เห็นจริง ไม่ใช่ id ภายใน เพราะ answers.skills ถูกส่งตรงไปเป็น
  // ข้อความในพรอมต์ของ AI แนะนำสาขา (api/recommend-major.js)
  const handleSkillToggle = (skillLabel) => {
    setSelectedSkills(prev =>
      prev.includes(skillLabel)
        ? prev.filter(label => label !== skillLabel)
        : [...prev, skillLabel]
    )
  }

  const handleNext = () => {
    if (selectedSkills.length === 0) {
      alert('กรุณาเลือกความถนัดอย่างน้อย 1 ข้อ')
      return
    }

    saveFindMajorAnswers({ skills: selectedSkills })
    navigate('/find-major/step4')
  }

  const handleBack = () => {
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

          {/* Main Content - Skills */}
          <main className="lg:col-span-6 space-y-5 lg:space-y-6">
            {/* Progress Header */}
            <div className="mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-pnru mb-1">ความถนัด</h1>
              <p className="text-xs lg:text-sm text-gray-500 mb-3">ขั้นตอนที่ 3 จาก 5</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-pnru h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm font-medium text-pnru">60%</span>
              </div>
            </div>

            {/* Card: Skills Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 inline">
                    คุณถนัดด้านใดบ้าง?
                  </h3>
                  <span className="text-sm text-gray-500 ml-2">(เลือกได้มากกว่า 1 ข้อ)</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {skills.map(skill => {
                  const IconComponent = skill.icon
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleSkillToggle(skill.label)}
                      aria-selected={selectedSkills.includes(skill.label)}
                      className={`relative flex flex-col p-4 lg:p-5 rounded-lg border-2 transition-all duration-150 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 ${
                        selectedSkills.includes(skill.label)
                          ? 'border-pnru bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-1 flex-col items-center justify-center gap-2 w-full">
                        <IconComponent
                          className={`w-10 h-10 lg:w-12 lg:h-12 ${
                            selectedSkills.includes(skill.label)
                              ? 'text-pnru'
                              : 'text-gray-600'
                          }`}
                          strokeWidth={1.5}
                        />
                        <p className={`font-medium text-sm lg:text-base text-center leading-tight ${
                          selectedSkills.includes(skill.label) ? 'text-pnru' : 'text-gray-800'
                        }`}>
                          {skill.label}
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
                เลือกทักษะที่คุณรู้สึกมั่นใจ
                หรือสิ่งที่คุณทำได้ดีกว่าคนอื่น
              </p>
              <div className="bg-[#E8F5F1] rounded-lg p-3 lg:p-4">
                <p className="text-xs lg:text-sm text-pnru font-medium leading-relaxed">
                  ไม่ต้องเก่งทุกอย่าง<br />
                  จุดแข็งของคุณคือกุญแจสู่ความสำเร็จ
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default FindMajorStep3
