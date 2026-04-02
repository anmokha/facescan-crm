'use client'

import React, { useState } from 'react'
import { Plus, X, Loader2, Settings, Users, Instagram, MessageCircle, BarChart3, Power, ExternalLink } from 'lucide-react'
import PageHeader from './PageHeader'
import { useAuth } from '@/lib/auth/AuthContext'

interface Prospect {
    id: string;
    name: string;
    slug: string;
    trafficWeight: number;
    isActive: boolean;
    contactChannel: 'whatsapp' | 'instagram';
    instagramHandle: string;
    whatsappNumber: string;
    leadCount: number;
}

export default function TdsManager({ initialProspects }: { initialProspects: any[] }) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ 
      name: '', 
      slug: '', 
      trafficWeight: 10,
      contactChannel: 'whatsapp' as 'whatsapp' | 'instagram',
      instagramHandle: '',
      whatsappNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { user } = useAuth()

  const handleUpdateField = async (id: string, field: string, value: any) => {
      setUpdatingId(id);
      try {
          const token = await user?.getIdToken();
          const res = await fetch(`/api/admin/clinics/${id}`, {
              method: 'PATCH',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ [field]: value })
          });
          if (!res.ok) throw new Error('Failed');
          
          setProspects(prospects.map(p => p.id === id ? { ...p, [field]: value } : p));
      } catch (e) {
          alert('Error updating prospect');
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
              body: JSON.stringify({ 
                  ...formData, 
                  type: 'prospect'
              })
          });
          if (!res.ok) throw new Error('Failed');
          const result = await res.json();

          const newProspect: Prospect = {
              id: result.id,
              ...formData,
              isActive: true,
              leadCount: 0
          };

          setProspects([...prospects, newProspect]);
          setIsModalOpen(false);
          setFormData({ 
              name: '', 
              slug: '', 
              trafficWeight: 10,
              contactChannel: 'whatsapp',
              instagramHandle: '',
              whatsappNumber: ''
          });
      } catch (e) {
          alert('Error creating prospect');
      } finally {
          setLoading(false);
      }
  }

  const totalWeight = prospects.filter(p => p.isActive).reduce((sum, p) => sum + (p.trafficWeight || 0), 0);

  return (
    <div>
      <PageHeader
        title="TDS Tracker"
        description="Traffic Distribution System for prospective clinics"
        breadcrumbs={[{ label: 'TDS Tracker' }]}
        icon={<BarChart3 className="text-purple-600" size={24} />}
        actions={
          <>
            <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 text-purple-700 text-sm font-medium">
              Active Weight: <span className="font-bold">{totalWeight}</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} /> Add Prospect
            </button>
          </>
        }
      />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider bg-gray-50">
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Clinic Name</th>
                    <th className="px-6 py-4 font-semibold">Weight (%)</th>
                    <th className="px-6 py-4 font-semibold">Channel</th>
                    <th className="px-6 py-4 font-semibold text-center">Leads</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {prospects.map((prospect) => {
                    const share = totalWeight > 0 && prospect.isActive 
                        ? ((prospect.trafficWeight / totalWeight) * 100).toFixed(1) 
                        : 0;

                    return (
                        <tr key={prospect.id} className={`hover:bg-gray-50 transition-colors group ${!prospect.isActive ? 'bg-gray-50/50 opacity-75' : ''}`}>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => handleUpdateField(prospect.id, 'isActive', !prospect.isActive)}
                                    disabled={updatingId === prospect.id}
                                    className={`p-2 rounded-lg transition-colors ${
                                        prospect.isActive 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                    }`}
                                >
                                    <Power size={16} />
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 text-base">{prospect.name}</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">/{prospect.slug}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        value={prospect.trafficWeight}
                                        onChange={(e) => handleUpdateField(prospect.id, 'trafficWeight', parseInt(e.target.value) || 0)}
                                        disabled={updatingId === prospect.id}
                                    />
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        ~{share}% of total
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-2">
                                    <select
                                        className="text-xs font-bold border border-gray-200 rounded px-2 py-1 bg-white"
                                        value={prospect.contactChannel}
                                        onChange={(e) => handleUpdateField(prospect.id, 'contactChannel', e.target.value)}
                                        disabled={updatingId === prospect.id}
                                    >
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="instagram">Instagram</option>
                                    </select>
                                    {prospect.contactChannel === 'whatsapp' ? (
                                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                            <MessageCircle size={14} />
                                            <input 
                                                className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none w-28"
                                                value={prospect.whatsappNumber || ''}
                                                placeholder="+971..."
                                                onChange={(e) => handleUpdateField(prospect.id, 'whatsappNumber', e.target.value)}
                                                onBlur={(e) => handleUpdateField(prospect.id, 'whatsappNumber', e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-pink-600 text-xs font-medium">
                                            <Instagram size={14} />
                                            <input 
                                                className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-pink-500 focus:outline-none w-28"
                                                value={prospect.instagramHandle || ''}
                                                placeholder="@username"
                                                onChange={(e) => handleUpdateField(prospect.id, 'instagramHandle', e.target.value)}
                                                onBlur={(e) => handleUpdateField(prospect.id, 'instagramHandle', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                                    <Users size={14} />
                                    {prospect.leadCount || 0}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <a
                                        href={`/admin/clinics/${prospect.id}/settings`}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                        title="Edit Services & Procedures"
                                    >
                                        <Settings size={18} />
                                    </a>
                                    <a
                                        href={`/checkup?client=${prospect.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                                        title="Preview Diagnostic"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Add Prospect Clinic</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Name</label>
                          <input
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Lucia Clinic Dubai"
                              value={formData.name}
                              onChange={e => {
                                  const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                  setFormData({ ...formData, name: e.target.value, slug })
                              }}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Traffic Weight (0-100)</label>
                          <input
                              type="number"
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              value={formData.trafficWeight}
                              onChange={e => setFormData({ ...formData, trafficWeight: parseInt(e.target.value) || 0 })}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Channel</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setFormData({...formData, contactChannel: 'whatsapp'})}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                                    formData.contactChannel === 'whatsapp' 
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                  <MessageCircle size={18} /> WhatsApp
                              </button>
                              <button
                                onClick={() => setFormData({...formData, contactChannel: 'instagram'})}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                                    formData.contactChannel === 'instagram' 
                                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                  <Instagram size={18} /> Instagram
                              </button>
                          </div>
                      </div>

                      {formData.contactChannel === 'whatsapp' ? (
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                              <input
                                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  placeholder="+971..."
                                  value={formData.whatsappNumber}
                                  onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                              />
                          </div>
                      ) : (
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram Handle</label>
                              <input
                                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                  placeholder="@luciaclinic"
                                  value={formData.instagramHandle}
                                  onChange={e => setFormData({ ...formData, instagramHandle: e.target.value })}
                              />
                          </div>
                      )}

                      <button
                          onClick={handleCreate}
                          disabled={loading}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {loading && <Loader2 className="animate-spin" size={18} />}
                          Add to Rotation
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}
