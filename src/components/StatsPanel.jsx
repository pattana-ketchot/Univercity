import { useState, useEffect } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

const StatsPanel = () => {
  const [totalCourses, setTotalCourses] = useState(12)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoursesCount()
  }, [])

  const fetchCoursesCount = async () => {
    // ถ้ายังไม่ได้ตั้งค่า Supabase ให้ใช้ค่าเริ่มต้น
    if (!isConfigured) {
      setLoading(false)
      return
    }

    try {
      const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error fetching courses count:', error)
      } else if (count !== null) {
        setTotalCourses(count)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { number: loading ? '...' : `${totalCourses}+`, label: 'หลักสูตร' },
    { number: 'แนะแนวอาชีพ', label: 'จากผู้เชียวชาญ' },
    { number: 'ข้อมูลจริง', label: 'จากหลักสูตร' },
    { number: 'เชื่อถือได้', label: 'อัพเดตทุกปี' }
  ]

  return (
    <div className="relative z-20 -mt-28 mb-12 max-w-[1920px] mx-auto px-24">
      <div className="bg-white rounded-xl shadow-lg px-6 py-4 max-w-4xl ml-auto mr-12">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          {stats.map((stat, index) => (
            <div key={index} className="text-center px-6">
              <div className="text-2xl font-bold text-pnru mb-1">{stat.number}</div>
              <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
