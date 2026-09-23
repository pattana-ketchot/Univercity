import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import AdminAuthInput from './AdminAuthInput'

// ช่องรหัสผ่าน + ปุ่มแสดง/ซ่อนรหัสผ่าน
const PasswordInput = ({ label = 'รหัสผ่าน', icon = Lock, ...props }) => {
  const [show, setShow] = useState(false)

  return (
    <AdminAuthInput
      label={label}
      icon={icon}
      type={show ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru/30"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      }
      {...props}
    />
  )
}

export default PasswordInput
