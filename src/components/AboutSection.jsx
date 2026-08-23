import { Users, Compass, Database, Lightbulb, CheckCircle, ClipboardCheck, Sparkles, FileText, MessageCircle } from 'lucide-react'

const AboutSection = () => {
  const infoCards = [
    {
      id: 1,
      icon: Users,
      title: 'เราเป็นใคร',
      content: 'SCI Advisor คือระบบแนะนำสาขาและอาชีพที่พัฒนาขึ้นเพื่อช่วยให้นักศึกษาค้นพบเส้นทางที่เหมาะกับตนเองได้ง่ายขึ้น'
    },
    {
      id: 2,
      icon: Compass,
      title: 'เราทำอะไรได้บ้าง',
      content: null,
      list: [
        'แนะนำสาขาที่เหมาะกับคุณ',
        'เปรียบเทียบรายละเอียดหลักสูตร',
        'แนะนำอาชีพหลังจบ',
        'ตอบคำถามด้วย AI'
      ]
    },
    {
      id: 3,
      icon: Database,
      title: 'ข้อมูลมาจากไหน',
      content: 'ข้อมูลหลักสูตรและอาชีพรวบรวมจากแหล่งข้อมูลของคณะและมหาวิทยาลัย รวมถึงแหล่งข้อมูลสาธารณะที่เชื่อถือได้ และมีการอัปเดตอย่างสม่ำเสมอ'
    },
    {
      id: 4,
      icon: Lightbulb,
      title: 'เรื่องที่ควรทราบ',
      content: 'คำแนะนำจาก AI เป็นข้อมูลเพื่อประกอบการตัดสินใจเท่านั้น ควรศึกษาข้อมูลเพิ่มเติมและปรึกษาอาจารย์หรือผู้เชี่ยวชาญก่อนตัดสินใจ'
    }
  ]

  const steps = [
    {
      id: 1,
      icon: ClipboardCheck,
      title: 'ทำแบบสอบถาม',
      description: 'ตอบคำถามเกี่ยวกับความสนใจและความถนัดของคุณ'
    },
    {
      id: 2,
      icon: Sparkles,
      title: 'วิเคราะห์ด้วย AI',
      description: 'ระบบ AI วิเคราะห์และจับคู่สาขาที่เหมาะสม'
    },
    {
      id: 3,
      icon: FileText,
      title: 'แสดงผลแนะนำ',
      description: 'รับผลแนะนำสาขาพร้อมข้อมูลรายละเอียด'
    },
    {
      id: 4,
      icon: MessageCircle,
      title: 'คุยกับ AI',
      description: 'สอบถามข้อมูลเพิ่มเติมกับ AI Advisor'
    }
  ]

  return (
    <section id="about" className="py-16 lg:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-pnru/20 rounded-full mb-4">
            <span className="text-sm font-medium text-pnru">เกี่ยวกับเรา</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            About SCI Advisor
          </h2>

          {/* Description */}
          <p className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-3">
            ผู้ช่วยแนะนำสาขา หลักสูตร และอาชีพ สำหรับนักศึกษาคณะวิทยาศาสตร์และเทคโนโลยี<br />
            มหาวิทยาลัยราชภัฏพระนคร
          </p>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-[150px] h-1 bg-pnru rounded-full"></div>
            <div className="w-2 h-2 bg-pnru rounded-full"></div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 lg:mb-16">
          {infoCards.map((card) => {
            const IconComponent = card.icon
            return (
              <div
                key={card.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon and Title - Same Row */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-pnru" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900">
                    {card.title}
                  </h3>
                </div>

                {/* Content */}
                {card.content && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.content}
                  </p>
                )}

                {/* List */}
                {card.list && (
                  <ul className="space-y-2">
                    {card.list.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-pnru flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* How it Works Section */}
        <div className="text-center mb-10">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            ทำงานอย่างไร?
          </h3>
          <p className="text-base text-gray-600">
            4 ขั้นตอนง่าย ๆ เพื่อค้นหาสาขาที่เหมาะกับคุณ
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {steps.map((step) => {
            const IconComponent = step.icon
            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Icon Circle */}
                <div className="w-[62px] h-[62px] bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-7 h-7 text-pnru" strokeWidth={2} />
                </div>

                {/* Text Block */}
                <div className="flex-1">
                  {/* Title */}
                  <h4 className="text-base font-bold text-black mb-1">
                    {step.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
