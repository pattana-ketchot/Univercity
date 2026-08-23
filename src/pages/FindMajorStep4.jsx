import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  DollarSign,
  Users,
  GraduationCap,
  Globe,
  Briefcase,
  Building2,
  Home,
  MapPin,
  Clock,
  Handshake,
  Check
} from 'lucide-react'

const FindMajorStep4 = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(4)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [selectedEnvironment, setSelectedEnvironment] = useState('')

  const steps = [
    { id: 1, title: 'ข้อมูลพื้นฐาน', status: 'completed' },
    { id: 2, title: 'ความสนใจ', status: 'completed' },
    { id: 3, title: 'ความถนัด', status: 'completed' },
    { id: 4, title: 'เป้าหมายอาชีพ', status: 'current' },
    { id: 5, title: 'ผลลัพธ์', status: 'pending' }
  ]

  const goals = [
    { id: 'career-growth', label: 'ทำงานในบริษัทขนาดใหญ่', description: 'ตำแหน่งสูงขึ้น มีโอกาสเติบโต', icon: TrendingUp },
    { id: 'high-income', label: 'เป็นเจ้าของธุรกิจ', description: 'เงินเดือนและสวัสดิการดี', icon: DollarSign },
    { id: 'help-people', label: 'สร้างสรรค์นวัตกรรม', description: 'คิดค้นสิ่งใหม่ๆ', icon: Users },
    { id: 'innovation', label: 'ทำงานเพื่อสังคม', description: 'คิดค้นสิ่งใหม่ๆ', icon: GraduationCap },
    { id: 'international', label: 'ฟรีแลนซ์', description: 'ร่วมงานกับต่างประเทศ', icon: Globe },
    { id: 'business', label: 'ศึกษาต่อ', description: 'เป็นเจ้าของกิจการ', icon: Briefcase }
  ]

  const environments = [
    { id: 'office', label: 'ออฟฟิศ', description: 'สำนักงานประจำ', icon: Building2 },
    { id: 'remote', label: 'ทำงานภาคสนาม', description: 'ออกพื้นที่จริง', icon: Home },
    { id: 'outdoor', label: 'ทำงานที่ไหนก็ได้', description: 'ยืดหยุ่นเวลา', icon: MapPin },
    { id: 'flexible', label: 'ทำงานเป็นทีม', description: 'ทีมเวิร์คเป็นหลัก', icon: Clock },
    { id: 'collaborative', label: 'ทำงานเดี่ยวโฟกัสกับงาน', description: 'ทำงานอิสระ', icon: Handshake }
  ]

  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleEnvironmentToggle = (envId) => {
    setSelectedEnvironment(envId)
  }

  const handleNext = () => {
    if (selectedGoals.length === 0) {
      alert('กรุณาเลือกเป้าหมายอย่างน้อย 1 ข้อ')
      return
    }
    if (!selectedEnvironment) {
      alert('กรุณาเลือกสภาพแวดล้อม')
      return
    }

    console.log('Selected goals:', selectedGoals)
    console.log('Selected environment:', selectedEnvironment)
    alert('ข้อมูลถูกบันทึกแล้ว (ขั้นตอนถัดไปยังไม่ได้สร้าง)')
  }

  const handleBack = () => {
    navigate('/find-major/step3')
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

          {/* Main Content - Career Goals */}
          <main className="lg:col-span-6 space-y-5 lg:space-y-6">
            {/* Progress Header */}
            <div className="mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-pnru mb-1">เป้าหมายอาชีพ</h1>
              <p className="text-xs lg:text-sm text-gray-500 mb-3">ขั้นตอนที่ 4 จาก 5</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-pnru h-2 rounded-full transition-all duration-300" style={{ width: '80%' }}></div>
                </div>
                <span className="text-sm font-medium text-pnru">80%</span>
              </div>
            </div>

            {/* Card 1: Goals Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 inline">
                    เลือกเป้าหมายหรือสิ่งที่คุณต้องการในอนาคต
                  </h3>
                  <span className="text-sm text-gray-500 ml-2">(เลือกได้มากกว่า 1 ข้อ)</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {goals.map(goal => {
                  const IconComponent = goal.icon
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      aria-selected={selectedGoals.includes(goal.id)}
                      className={`relative p-4 lg:p-5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 ${
                        selectedGoals.includes(goal.id)
                          ? 'border-pnru bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkmark Badge */}
                      {selectedGoals.includes(goal.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-pnru rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <IconComponent
                          className={`w-10 h-10 lg:w-12 lg:h-12 ${
                            selectedGoals.includes(goal.id)
                              ? 'text-pnru'
                              : 'text-gray-600'
                          }`}
                          strokeWidth={1.5}
                        />
                        <p className="font-medium text-sm lg:text-base text-gray-800 text-center leading-tight">
                          {goal.label}
                        </p>
                        <p className="text-xs text-gray-500 text-center leading-tight">
                          {goal.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card 2: Environment Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pnru text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 ">
                    สภาพแวดล้อมที่คุณต้องการ
                  </h3>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {environments.map(env => {
                  const IconComponent = env.icon
                  return (
                    <button
                      key={env.id}
                      onClick={() => handleEnvironmentToggle(env.id)}
                      aria-selected={selectedEnvironment === env.id}
                      className={`relative p-4 lg:p-5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pnru focus:ring-offset-2 ${
                        selectedEnvironment === env.id
                          ? 'border-pnru bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkmark Badge */}
                      {selectedEnvironment === env.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-pnru rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <IconComponent
                          className={`w-10 h-10 lg:w-12 lg:h-12 ${
                            selectedEnvironment === env.id
                              ? 'text-pnru'
                              : 'text-gray-600'
                          }`}
                          strokeWidth={1.5}
                        />
                        <p className="font-medium text-sm lg:text-base text-gray-800 text-center leading-tight">
                          {env.label}
                        </p>
                        <p className="text-xs text-gray-500 text-center leading-tight">
                          {env.description}
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
                คิดถึงสิ่งที่คุณต้องการบรรลุในอีก 5-10 ปีข้างหน้า
                และสภาพแวดล้อมที่ทำให้คุณทำงานได้อย่างมีความสุข
              </p>
              <div className="bg-[#E8F5F1] rounded-lg p-3 lg:p-4">
                <p className="text-xs lg:text-sm text-pnru font-medium leading-relaxed">
                  เป้าหมายที่ชัดเจน<br />
                  จะช่วยให้คุณเลือกเส้นทางได้ถูกต้อง
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default FindMajorStep4
