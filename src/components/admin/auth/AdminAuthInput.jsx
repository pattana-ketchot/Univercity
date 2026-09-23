import { useId } from 'react'

// ช่องกรอกข้อมูลของหน้า auth ผู้ดูแลระบบ — label + ไอคอนซ้าย (ถ้ามี) + ข้อความ error ใต้ช่อง
// รองรับ slot ด้านขวา (rightSlot) สำหรับปุ่มแสดง/ซ่อนรหัสผ่าน
const AdminAuthInput = ({
  label,
  icon: Icon,
  error,
  rightSlot,
  id,
  className = '',
  ...inputProps
}) => {
  const autoId = useId()
  const inputId = id || autoId
  const errorId = `${inputId}-error`

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        )}
        <input
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${rightSlot ? 'pr-12' : 'pr-4'} py-2.5 border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-300 focus:ring-pnru/30 focus:border-pnru'
          }`}
          {...inputProps}
        />
        {rightSlot && (
          <div className="absolute right-0.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default AdminAuthInput
