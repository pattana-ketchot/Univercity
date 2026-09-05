import { Users, Compass, Database, Lightbulb, CheckCircle, ClipboardCheck, Sparkles, FileText, MessageCircle } from 'lucide-react'
import Reveal from './Reveal'

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
    <section id="about" className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 md:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          {/* Badge + Title */}
          <Reveal as="div" className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 border border-pnru/20 rounded-full mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-pnru">เกี่ยวกับเรา</span>
          </Reveal>

          {/* Title */}
          <Reveal as="h2" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            About SCI Advisor
          </Reveal>

          {/* Description */}
          <Reveal as="p" delay={80} className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-3">
            ผู้ช่วยแนะนำสาขา หลักสูตร และอาชีพ สำหรับนักศึกษาคณะวิทยาศาสตร์และเทคโนโลยี<br />
            มหาวิทยาลัยราชภัฏพระนคร
          </Reveal>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-[100px] sm:w-[130px] lg:w-[150px] h-1 bg-pnru rounded-full"></div>
            <div className="w-2 h-2 bg-pnru rounded-full"></div>
          </div>
        </div>

        {/* Info Cards Grid — cards stagger in left to right, index order preserved */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12 md:mb-16">
          {infoCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <Reveal
                as="div"
                key={card.id}
                direction="left"
                delay={index * 80}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon and Title - Same Row */}
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-pnru" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
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
              </Reveal>
            )
          })}
        </div>

        {/* How it Works Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <Reveal as="h3" className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            ทำงานอย่างไร?
          </Reveal>
          <Reveal as="p" delay={80} className="text-sm sm:text-base text-gray-600">
            4 ขั้นตอนง่าย ๆ เพื่อค้นหาสาขาที่เหมาะกับคุณ
          </Reveal>
        </div>

        {/* Steps Grid — cards stagger in left to right, index order preserved */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <Reveal as="div" key={step.id} direction="left" delay={index * 80} className="flex items-start gap-3 sm:gap-4">
                {/* Icon Circle */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-[62px] md:h-[62px] bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-pnru" strokeWidth={2} />
                </div>

                {/* Text Block */}
                <div className="flex-1">
                  {/* Title */}
                  <h4 className="text-sm sm:text-base font-bold text-black mb-1">
                    {step.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
