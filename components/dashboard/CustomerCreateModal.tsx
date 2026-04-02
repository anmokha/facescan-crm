'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Copy, Check, Download, QrCode, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/lib/auth/AuthContext'
import { ClinicService } from '@/lib/diagnostic/dashboardService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/diagnostic/firebaseConfig'

interface TreatmentEntry {
    serviceId: string
    serviceName: string
    price?: string
    completedSessions: number
    totalSessions: number
    lastSessionDate?: string
}

interface CreatedCustomerResponse {
    customerId: string
    publicToken: string
    retentionLink: string
    journeyLink: string
}

interface CustomerCreateModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CustomerCreateModal({ isOpen, onClose, onSuccess }: CustomerCreateModalProps) {
    const { user } = useAuth()

    // Form state
    const [phone, setPhone] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    // Clinic services
    const [services, setServices] = useState<ClinicService[]>([])
    const [loadingServices, setLoadingServices] = useState(false)

    // Selected treatments
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
    const [treatmentEntries, setTreatmentEntries] = useState<Map<string, TreatmentEntry>>(new Map())

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Success state
    const [createdCustomer, setCreatedCustomer] = useState<CreatedCustomerResponse | null>(null)
    const [copiedLink, setCopiedLink] = useState(false)

    // Load clinic services
    useEffect(() => {
        if (!user || !isOpen) return

        async function loadServices() {
            if (!user) return

            setLoadingServices(true)
            try {
                const clinicRef = doc(db, 'clinics', user.uid)
                const clinicSnap = await getDoc(clinicRef)

                if (clinicSnap.exists()) {
                    const clinicData = clinicSnap.data()
                    setServices(clinicData.services || [])
                }
            } catch (e) {
                console.error('Failed to load services:', e)
            } finally {
                setLoadingServices(false)
            }
        }

        loadServices()
    }, [user, isOpen])

    const handleServiceToggle = (service: ClinicService) => {
        const serviceId = service.name  // Use name as unique identifier
        const newSelected = new Set(selectedServices)
        const newEntries = new Map(treatmentEntries)

        if (newSelected.has(serviceId)) {
            newSelected.delete(serviceId)
            newEntries.delete(serviceId)
        } else {
            newSelected.add(serviceId)
            newEntries.set(serviceId, {
                serviceId,
                serviceName: service.name,
                price: service.price,
                completedSessions: 0,
                totalSessions: 4,  // Default to 4 sessions
                lastSessionDate: undefined
            })
        }

        setSelectedServices(newSelected)
        setTreatmentEntries(newEntries)
    }

    const handleEntryUpdate = (serviceId: string, field: keyof TreatmentEntry, value: any) => {
        const newEntries = new Map(treatmentEntries)
        const entry = newEntries.get(serviceId)
        if (entry) {
            newEntries.set(serviceId, { ...entry, [field]: value })
            setTreatmentEntries(newEntries)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!phone) {
            setError('Phone number is required')
            return
        }

        if (!user) {
            setError('No access')
            return
        }

        setIsSubmitting(true)

        try {
            const token = await user.getIdToken()

            const treatmentHistory = Array.from(treatmentEntries.values())

            const response = await fetch('/api/dashboard/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone,
                    name,
                    email,
                    treatmentHistory
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error creating customer')
            }

            // Success!
            setCreatedCustomer(data)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create customer')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCopyLink = () => {
        if (createdCustomer) {
            navigator.clipboard.writeText(createdCustomer.retentionLink)
            setCopiedLink(true)
            setTimeout(() => setCopiedLink(false), 2000)
        }
    }

    const handleDownloadQR = () => {
        if (!createdCustomer) return

        const svg = document.getElementById('retention-qr')
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg)
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()
            img.onload = () => {
                canvas.width = 1024
                canvas.height = 1024
                if (ctx) {
                    ctx.fillStyle = 'white'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                    const padding = 64
                    const size = canvas.width - (padding * 2)
                    ctx.drawImage(img, padding, padding, size, size)
                }
                const pngFile = canvas.toDataURL('image/png')
                const downloadLink = document.createElement('a')
                downloadLink.download = `qr-retention-${phone.replace(/\D/g, '')}.png`
                downloadLink.href = pngFile
                downloadLink.click()
            }
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
        }
    }

    const handleClose = () => {
        if (createdCustomer) {
            onSuccess()  // Refresh customers list
        }
        // Reset form
        setPhone('')
        setName('')
        setEmail('')
        setSelectedServices(new Set())
        setTreatmentEntries(new Map())
        setCreatedCustomer(null)
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    // Success modal
    if (createdCustomer) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} className="text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Customer Created!</h3>
                        <p className="text-slate-500">You can now send a link to the client for retention</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-6 flex flex-col items-center">
                        <QRCodeSVG
                            id="retention-qr"
                            value={createdCustomer.retentionLink}
                            size={200}
                            level="H"
                            includeMargin={true}
                            className="mb-4"
                        />
                        <button
                            onClick={handleDownloadQR}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                        >
                            <Download size={16} /> Download QR Code
                        </button>
                    </div>

                    {/* Retention Link */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Retention Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={createdCustomer.retentionLink}
                                className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl p-3 font-mono"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-3 rounded-xl font-bold transition-all ${
                                    copiedLink
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Journey Link */}
                    <div className="mb-6 text-sm text-slate-500">
                        <a
                            href={createdCustomer.journeyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                        >
                            <ExternalLink size={14} />
                            Customer Portal (for tracking progress)
                        </a>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        )
    }

    // Creation form
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Add Customer for Retention</h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            placeholder="+971 50 123 4567"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Name (optional)</label>
                        <input
                            type="text"
                            placeholder="Anna Petrova"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email (optional)</label>
                        <input
                            type="email"
                            placeholder="anna@example.com"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Treatment History */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Treatment History (optional)
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Select procedures the client has already started but not completed
                        </p>

                        {loadingServices ? (
                            <div className="text-center text-slate-400 py-4">Loading services...</div>
                        ) : services.length === 0 ? (
                            <div className="text-center text-slate-400 py-4 bg-slate-50 rounded-xl">
                                First, add services in clinic settings
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {services.map((service) => {
                                    const serviceId = service.name  // Use name as unique identifier
                                    const isSelected = selectedServices.has(serviceId)
                                    const entry = treatmentEntries.get(serviceId)

                                    return (
                                        <div key={serviceId} className="border border-slate-200 rounded-xl p-4">
                                            {/* Service checkbox */}
                                            <label className="flex items-center gap-3 cursor-pointer mb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleServiceToggle(service)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-900">{service.name}</div>
                                                    {service.price && (
                                                        <div className="text-xs text-slate-500">{service.price}</div>
                                                    )}
                                                </div>
                                            </label>

                                            {/* Sessions inputs (only if selected) */}
                                            {isSelected && entry && (
                                                <div className="grid grid-cols-2 gap-3 pl-7">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                                            Completed Sessions
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={entry.completedSessions}
                                                            onChange={(e) =>
                                                                handleEntryUpdate(
                                                                    serviceId,
                                                                    'completedSessions',
                                                                    parseInt(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-2"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                                            Total Sessions
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={entry.totalSessions}
                                                            onChange={(e) =>
                                                                handleEntryUpdate(
                                                                    serviceId,
                                                                    'totalSessions',
                                                                    parseInt(e.target.value) || 1
                                                                )
                                                            }
                                                            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-2"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                                            Last Visit (optional)
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={entry.lastSessionDate || ''}
                                                            onChange={(e) =>
                                                                handleEntryUpdate(serviceId, 'lastSessionDate', e.target.value)
                                                            }
                                                            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-2"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>Creating customer...</>
                        ) : (
                            <>
                                <Plus size={18} /> Create Customer
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
