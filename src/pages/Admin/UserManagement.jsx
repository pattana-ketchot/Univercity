import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  Users,
  Shield,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Crown,
  Pencil,
  User as UserIcon
} from 'lucide-react'

const UserManagement = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    checkCurrentUser()
    fetchUsers()
  }, [])

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/admin/login')
      return
    }

    // ตรวจสอบว่าเป็น admin หรือไม่
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
      navigate('/admin/dashboard')
      return
    }

    setCurrentUser(user)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // ดึงข้อมูล users จาก user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // ดึงข้อมูล email จาก auth.users ผ่าน RPC function
      const usersWithEmail = await Promise.all(
        (data || []).map(async (profile) => {
          // ใช้ admin API เพื่อดึง email
          const { data: { user }, error } = await supabase.auth.admin.getUserById(profile.user_id)

          return {
            ...profile,
            email: user?.email || 'N/A'
          }
        })
      )

      setUsers(usersWithEmail)
    } catch (error) {
      console.error('Error fetching users:', error)
      // ถ้า admin API ไม่ทำงาน ให้ดึงแบบธรรมดา
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`คุณต้องการเปลี่ยน Role เป็น "${newRole}" หรือไม่?`)) return

    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', userId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('เปลี่ยน Role สำเร็จ')
      fetchUsers()
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) return

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('ลบผู้ใช้สำเร็จ')
      fetchUsers()
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          icon: <Crown className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          label: 'Admin'
        }
      case 'editor':
        return {
          icon: <Pencil className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          label: 'Editor'
        }
      default:
        return {
          icon: <UserIcon className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          label: 'User'
        }
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Users className="w-6 h-6 text-pnru" />
              <h1 className="text-xl font-bold text-gray-800">จัดการผู้ใช้</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'admin').length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Administrators</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pencil className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'editor').length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Editors</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'user').length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Users</h3>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาผู้ใช้ด้วย Email, ชื่อ, หรือ Role..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pnru focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pnru"></div>
              <p className="mt-2 text-gray-600">กำลังโหลด...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">ไม่พบผู้ใช้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ผู้ใช้
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สร้าง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เปลี่ยน Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role)
                    const isCurrentUser = currentUser?.id === user.user_id

                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-pnru to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {user.email || 'N/A'}
                                {isCurrentUser && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">คุณ</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{user.full_name || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color}`}>
                            {roleBadge.icon}
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                            disabled={isCurrentUser}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pnru disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="user">User</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user.user_id)}
                            disabled={isCurrentUser}
                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            title={isCurrentUser ? 'ไม่สามารถลบตัวเองได้' : 'ลบผู้ใช้'}
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">ข้อมูลเกี่ยวกับ Role:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Admin:</strong> สิทธิ์เต็ม - จัดการทุกอย่างรวมถึงผู้ใช้</li>
                <li>• <strong>Editor:</strong> เพิ่ม แก้ไข หลักสูตรและข่าวสาร (ลบไม่ได้)</li>
                <li>• <strong>User:</strong> ดูข้อมูลเท่านั้น ไม่สามารถแก้ไขได้</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
