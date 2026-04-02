'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { UserPlus, Shield, Trash2, Loader2, Users as UsersIcon, ShieldAlert, X } from 'lucide-react'
import { Role, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/auth/permissions'
import PageHeader from '@/components/admin/PageHeader'

interface AdminUser {
  uid: string
  email: string
  role: Role
  permissions: string[]
  assignedClinics: string[]
  createdAt: string
  status: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const [newUser, setNewUser] = useState({
    email: '',
    role: Role.SUPPORT as Role,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    if (!user) return

    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin/users/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to fetch users')

      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!user || !newUser.email) return

    setCreating(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin/users/grant-role', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          role: newUser.role,
          assignedClinics: [],
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create user')
      }

      const data = await res.json()

      alert(`✅ Admin user created successfully!\n\nPassword reset link:\n${data.passwordResetLink}\n\nSend this to the new admin.`)

      setShowCreateModal(false)
      setNewUser({ email: '', role: Role.SUPPORT })
      fetchUsers()

    } catch (error: any) {
      console.error('Failed to create user:', error)
      alert('Error: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeRole = async (uid: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${email}?`)) return

    try {
      const token = await user!.getIdToken()
      const res = await fetch('/api/admin/users/revoke-role', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid })
      })

      if (!res.ok) throw new Error('Failed to revoke role')

      alert('✅ Admin role revoked successfully')
      fetchUsers()

    } catch (error) {
      console.error('Failed to revoke role:', error)
      alert('Error revoking role')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Admin Users"
          description="Manage admin access and roles"
          breadcrumbs={[{ label: 'Admin Users' }]}
          icon={<ShieldAlert className="text-blue-600" size={24} />}
          actions={
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <UserPlus size={18} />
              Add Admin User
            </button>
          }
        />

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Assigned Clinics</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((adminUser) => (
                <tr key={adminUser.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{adminUser.email}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{adminUser.uid.substring(0, 12)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      <Shield size={14} />
                      {ROLE_LABELS[adminUser.role]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {adminUser.assignedClinics.length > 0
                        ? `${adminUser.assignedClinics.length} clinics`
                        : 'All clinics'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(adminUser.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRevokeRole(adminUser.uid, adminUser.email)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                      title="Revoke admin access"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <UsersIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No admin users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Admin User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  >
                    {Object.values(Role).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-2">
                    {ROLE_DESCRIPTIONS[newUser.role]}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={creating || !newUser.email}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating && <Loader2 className="animate-spin" size={18} />}
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
