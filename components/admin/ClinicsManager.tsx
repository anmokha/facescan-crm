'use client'

import React, { useState } from 'react'
import { Plus, X, Loader2, ExternalLink, Settings, Users, MonitorPlay, Building2, Mail } from 'lucide-react'
import ImpersonateButton from './ImpersonateButton'
import PageHeader from './PageHeader'
import { useAuth } from '@/lib/auth/AuthContext'

export default function ClinicsManager({ initialClinics }: { initialClinics: any[] }) {
  const [clinics, setClinics] = useState(initialClinics)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', slug: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { user } = useAuth()

  const handleUpdateField = async (clinicId: string, field: string, value: any) => {
      setUpdatingId(clinicId);
      try {
          const token = await user?.getIdToken();
          const res = await fetch(`/api/admin/clinics/${clinicId}`, {
              method: 'PATCH',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ [field]: value })
          });
          if (!res.ok) throw new Error('Failed');
          
          setClinics(clinics.map(c => c.id === clinicId ? { ...c, [field]: value } : c));
      } catch (e) {
          alert('Error updating clinic');
      } finally {
          setUpdatingId(null);
      }
  }

  const handleCreate = async () => {
      if(!formData.name || !formData.slug) return;
      setLoading(true);
      try {
          const token = await user?.getIdToken();
          const res = await fetch('/api/admin/clinics', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(formData)
          });
          if (!res.ok) throw new Error('Failed');
          const newClinic = await res.json();

          // Refresh or append
          setClinics([...clinics, { ...newClinic, leadCount: 0 }]); // Optimistic update
          setIsModalOpen(false);
          setFormData({ name: '', slug: '', email: '' });
      } catch (e) {
          alert('Error creating clinic');
      } finally {
          setLoading(false);
      }
  }

  return (
    <div>
      <PageHeader
        title="Clinics"
        description="Manage all B2B tenants from one place"
        breadcrumbs={[{ label: 'Clinics' }]}
        icon={<Building2 className="text-blue-600" size={24} />}
        actions={
          <>
            <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium">
              Total: <span className="text-gray-900 font-bold ml-1">{clinics.length}</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} /> New Clinic
            </button>
          </>
        }
      />

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider bg-gray-50">
                    <th className="px-6 py-4 font-semibold">Clinic Name</th>
                    <th className="px-6 py-4 font-semibold">Slug / Domain</th>
                    <th className="px-6 py-4 font-semibold">Checkups / Pilot</th>
                    <th className="px-6 py-4 font-semibold text-center">Leads</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {clinics.map((clinic: any) => (
                    <tr key={clinic.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-base">{clinic.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-1">ID: {clinic.id}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono border border-blue-200">
                                    {clinic.slug}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-gray-700">
                                        {clinic.checkupCount || 0} / 
                                    </div>
                                    <input 
                                        type="number"
                                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={clinic.checkupLimit ?? 0}
                                        onChange={(e) => handleUpdateField(clinic.id, 'checkupLimit', parseInt(e.target.value))}
                                        disabled={updatingId === clinic.id}
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={clinic.isPilot || false}
                                        onChange={(e) => handleUpdateField(clinic.id, 'isPilot', e.target.checked)}
                                        disabled={updatingId === clinic.id}
                                    />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Pilot (Unlimited)</span>
                                </label>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                                <Users size={14} />
                                {clinic.leadCount}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <ImpersonateButton clinicId={clinic.id} />

                                <a
                                    href={`/checkup?client=${clinic.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                    title="Open Landing Page"
                                >
                                    <MonitorPlay size={18} />
                                </a>
                                <a
                                    href={`/admin/clinics/${clinic.id}/settings`}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                    title="Edit Settings"
                                >
                                    <Settings size={18} />
                                </a>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Add New Clinic</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Name</label>
                          <input
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Epilux Dubai"
                              value={formData.name}
                              onChange={e => {
                                  // Auto-slug
                                  const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                  setFormData({ ...formData, name: e.target.value, slug })
                              }}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (ID)</label>
                          <input
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="epilux-dubai"
                              value={formData.slug}
                              onChange={e => setFormData({ ...formData, slug: e.target.value })}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Email</label>
                          <input
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="owner@clinic.com"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                          />
                      </div>

                      <button
                          onClick={handleCreate}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {loading && <Loader2 className="animate-spin" size={18} />}
                          Create Clinic
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}
