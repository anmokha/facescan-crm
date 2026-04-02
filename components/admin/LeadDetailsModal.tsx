'use client'

import React, { useState } from 'react'
import { X, ExternalLink, Sparkles, Eye, Phone, Mail, MapPin, Copy, Check, MessageCircle, AlertTriangle, Wallet, ArrowRight, Zap, Save, DollarSign, Tag } from 'lucide-react'
import { updateLead } from '@/lib/diagnostic/dashboardService'
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/lib/i18n'
import { useDashboardI18nOptional } from '@/lib/i18n/dashboard'
import { getMessages } from '@/lib/i18n/messages'

// Define types locally or import (using any for flexibility with legacy leads)
interface ModalProps {
    lead: any;
    onClose: () => void;
    defaultOpenTransaction?: boolean;
}

export default function LeadDetailsModal({ lead, onClose, defaultOpenTransaction }: ModalProps) {
    if (!lead) return null;
    const dashboardI18n = useDashboardI18nOptional()
    const locale: Locale = dashboardI18n?.locale ?? (isSupportedLocale(lead?.locale) ? lead.locale : DEFAULT_LOCALE)
    const messages = dashboardI18n?.messages ?? getMessages(locale)
    
    // --- Data Extraction ---
    const analysis = lead.analysisResult?.hidden_analysis || {};
    const signals = analysis.marketing_signals || {};
    const strategy = analysis.sales_strategy || {};
    const waTemplates = analysis.whatsapp_templates || {};
    const profile = lead.analysisResult?.profile || {};
    const treatments = lead.analysisResult?.clinicTreatments || [];

    // --- Transaction State ---
    const [status, setStatus] = useState(lead.status || 'new');
    const [soldService, setSoldService] = useState(lead.soldService || '');
    const [revenue, setRevenue] = useState(lead.revenue || 0);
    const [isSaving, setIsSaving] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(lead.status === 'converted' || defaultOpenTransaction);

    const handleSaveTransaction = async () => {
        setIsSaving(true);
        try {
            await updateLead(lead.id, { 
                status: 'converted',
                soldService, 
                revenue: Number(revenue) 
            });
            setStatus('converted');
            // Show success feedback?
        } catch (e) {
            console.error("Failed to save transaction", e);
            alert(messages.leadModalSaveError);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Tier Logic ---
    const getTier = () => {
        const isRich = (analysis.premium_affinity_markers?.length || 0) > 0;
        const isExperienced = signals.has_suspected_procedures;
        const score = profile.skin_score || 50;

        if (isRich && isExperienced) return { name: 'VIP Gold', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🏆' };
        if (isRich) return { name: 'High Income', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '💰' };
        if (isExperienced) return { name: 'Experienced', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '💉' };
        if (score < 60) return { name: 'Urgent Care', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' };
        return { name: 'Standard', color: 'bg-green-100 text-green-800 border-green-200', icon: '🌱' };
    };
    const tier = getTier();

    // --- LTV Calculation ---
    const ltvPotential = treatments.reduce((sum: number, t: any) => {
        if (!t.price) return sum;
        // Handle ranges like "10 000 - 15 000" by taking the first part
        const lowerBound = t.price.split(/[-–—]|\s\u0434\u043e\s/i)[0]; 
        // Remove non-digits to get clean integer
        const price = parseInt(lowerBound.replace(/\D/g, '') || '0');
        return sum + price;
    }, 0);

    // --- WhatsApp Logic ---
    const [showWaMenu, setShowWaMenu] = useState(false);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const openWa = (text?: string) => {
        const phone = lead.phone.replace(/\D/g, '');
        const url = `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            
            {/* Modal Container (Wide) */}
            <div className="bg-slate-50 h-full w-full max-w-5xl shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200">
                
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-lg text-slate-600">
                            {lead.phone.slice(-4)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="text-xl font-bold text-slate-900">{lead.phone}</h2>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${tier.color}`}>
                                    {tier.icon} {tier.name}
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs flex items-center gap-2">
                                <span className="font-mono">ID: {lead.id.slice(0,8)}</span> • 
                                <span>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
                    
                    {/* LEFT COLUMN: Customer Profile (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Spy Card */}
                        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl ring-1 ring-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Eye size={80} />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <Sparkles size={12} className="text-purple-400" /> Intelligence
                            </h4>
                            
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                    <span className="text-sm text-slate-400">Skin Score</span>
                                    <span className={`text-2xl font-bold font-mono ${
                                        (profile.skin_score || 0) < 60 ? 'text-red-400' : 'text-emerald-400'
                                    }`}>{profile.skin_score || '?'}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                    <span className="text-sm text-slate-400">Visual Age</span>
                                    <span className="text-2xl font-bold font-mono">{analysis.estimated_visual_age || '?'}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                    <span className="text-sm text-slate-400">Problem Severity</span>
                                    <span className={`text-sm font-bold uppercase ${
                                        analysis.problem_severity === 'Critical' ? 'text-red-400' :
                                        analysis.problem_severity === 'High' ? 'text-orange-400' :
                                        analysis.problem_severity === 'Medium' ? 'text-yellow-400' :
                                        'text-green-400'
                                    }`}>{analysis.problem_severity || 'Low'}</span>
                                </div>
                                {signals.tired_look_score > 0 && (
                                    <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                        <span className="text-sm text-slate-400">Tired Look</span>
                                        <span className="text-2xl font-bold font-mono text-purple-400">{signals.tired_look_score}/10</span>
                                    </div>
                                )}

                                {/* Markers List */}
                                <div className="space-y-2 pt-2">
                                    {signals.lip_volume === 'Thin' && (
                                        <div className="flex items-center gap-2 text-xs text-pink-300 bg-pink-500/10 px-2 py-1.5 rounded">
                                            💋 {messages.leadModalMarkerThinLips}
                                        </div>
                                    )}
                                    {['Moderate', 'Severe'].includes(signals.ptosis_severity) && (
                                        <div className="flex items-center gap-2 text-xs text-orange-300 bg-orange-500/10 px-2 py-1.5 rounded">
                                            🔻 {messages.leadModalMarkerPtosis}
                                        </div>
                                    )}
                                    {signals.has_suspected_procedures && (
                                        <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 px-2 py-1.5 rounded">
                                            💉 {messages.leadModalMarkerExperienced}
                                        </div>
                                    )}
                                    {(analysis.premium_affinity_markers?.length || 0) > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1.5 rounded">
                                            💎 High Income
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Problems Summary */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Found Issues</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.issues?.map((issue: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-bold border border-red-100">
                                        {issue}
                                    </span>
                                ))}
                                {(!profile.issues || profile.issues.length === 0) && (
                                    <span className="text-slate-400 text-xs italic">{messages.leadModalNoIssues}</span>
                                )}
                            </div>
                        </div>

                        {/* WhatsApp Status */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                                WhatsApp Status
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <div className="text-xs text-slate-500 mb-1">Opt-in Status</div>
                                    <div className="font-bold text-slate-900">
                                        {lead.whatsappOptIn ? (
                                            <span className="text-emerald-600 flex items-center gap-2">
                                                <Check size={16} /> Consented
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <X size={16} /> No consent
                                            </span>
                                        )}
                                    </div>
                                    {lead.consentTimestamp && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            {new Date(lead.consentTimestamp.seconds * 1000).toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <div className="text-xs text-slate-500 mb-1">WhatsApp Activity</div>
                                    <div className="font-bold text-slate-900">
                                        {lead.whatsappClicked ? (
                                            <span className="text-emerald-600 flex items-center gap-2">
                                                <MessageCircle size={16} /> Initiated
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Not clicked</span>
                                        )}
                                    </div>
                                    {lead.whatsappClickedProcedure && (
                                        <div className="text-xs text-slate-600 mt-1">
                                            Clicked: {lead.whatsappClickedProcedure}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!lead.whatsappOptIn && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                    <div className="text-xs text-amber-800">
                                        <span className="font-bold">No WhatsApp consent.</span> Contact via phone call or SMS first, then invite to WhatsApp.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Marketing Segments */}
                        {signals.recommended_audiences?.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-200 shadow-sm">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-3 flex items-center gap-1">
                                    <Tag size={12} /> Recommended Segments
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {signals.recommended_audiences.map((aud: string, i: number) => (
                                        <span key={i} className="px-2.5 py-1 bg-white text-purple-700 rounded-lg text-xs font-semibold border border-purple-200 shadow-sm">
                                            {aud.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Raw JSON Toggle */}
                        <details className="text-xs text-slate-400 cursor-pointer">
                            <summary className="hover:text-slate-600 transition-colors">Show Raw JSON</summary>
                            <pre className="mt-2 p-3 bg-slate-100 rounded-lg overflow-auto max-h-40 text-[10px]">
                                {JSON.stringify(lead, null, 2)}
                            </pre>
                        </details>
                    </div>

                    {/* CENTER COLUMN: Product Matrix (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Treatments List */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Zap size={16} className="text-amber-500" />
                                Recommended Treatments
                            </h4>
                            
                            {treatments.length > 0 ? treatments.map((t: any, idx: number) => (
                                <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h5 className="font-bold text-slate-900 text-base">{t.name}</h5>
                                        <span className="bg-slate-100 text-slate-700 font-mono font-bold text-sm px-2 py-1 rounded-lg group-hover:bg-slate-200 transition-colors">
                                            {t.price}
                                        </span>
                                    </div>
                                            <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100/50">
                                        <p className="text-xs text-indigo-900 font-medium flex gap-2">
                                            <span className="shrink-0 mt-0.5">💡</span>
                                            {t.reason || messages.leadModalTreatmentReasonFallback}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-8 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                                    {messages.leadModalNoPriceRecommendations}
                                </div>
                            )}
                        </div>

                        {/* Scare Tactic */}
                        {profile.prognosis?.negative_scenario && (
                             <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex gap-3">
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Pain Point Trigger</p>
                                    <p className="text-sm text-red-800 leading-snug">
                                        "{profile.prognosis.negative_scenario}"
                                    </p>
                                </div>
                             </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Action Center (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col h-full space-y-6">
                        
                        {/* Transaction Card */}
                        <div className={`rounded-2xl border p-5 shadow-sm transition-all ${status === 'converted' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
	                            <div className="flex justify-between items-center mb-4">
	                                <h4 className={`font-bold flex items-center gap-2 ${status === 'converted' ? 'text-emerald-900' : 'text-slate-900'}`}>
	                                    <DollarSign size={18} className={status === 'converted' ? 'text-emerald-600' : 'text-slate-400'} />
	                                    {messages.leadModalVisitResultTitle}
	                                </h4>
	                                {status === 'converted' && (
	                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded">
	                                    {messages.leadModalPaidBadge}
	                                  </span>
	                                )}
	                            </div>

                            {(!showTransactionForm && status !== 'converted') ? (
                                <button 
                                    key="mark-btn"
                                    onClick={() => setShowTransactionForm(true)}
                                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
	                                >
	                                    <Check size={18} />
	                                    {messages.leadModalMarkSale}
	                                </button>
	                            ) : (
	                                <div key="trans-form" className="space-y-3">
	                                    <div>
	                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{messages.leadModalServiceLabel}</label>
	                                        <div className="relative">
	                                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
	                                            <input 
	                                                type="text" 
	                                                value={soldService}
	                                                onChange={(e) => setSoldService(e.target.value)}
	                                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
	                                                placeholder={messages.leadModalServicePlaceholder}
	                                            />
	                                        </div>
	                                    </div>
	                                    <div>
	                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{messages.leadModalAmountLabel}</label>
	                                        <div className="relative">
	                                            <input 
	                                                type="number" 
	                                                value={revenue}
	                                                onChange={(e) => setRevenue(Number(e.target.value))}
	                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
	                                                placeholder="0"
	                                            />
	                                        </div>
	                                    </div>
                                    <button 
                                        onClick={handleSaveTransaction}
                                        disabled={isSaving}
                                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-100"
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 flex items-center justify-center">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <Save size={18} />
                                        )}
	                                        <span>{messages.leadModalSaveButton}</span>
	                                    </button>
	                                </div>
	                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-grow flex flex-col">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <MessageCircle size={18} className="text-blue-500" />
                                    Sales Scripts
                                </h4>
                            </div>

                            <div className="p-5 space-y-6 overflow-y-auto max-h-[500px]">
                                {/* Hook */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">1. The Hook (Intro)</p>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-slate-700 cursor-pointer hover:bg-blue-100 transition-colors" onClick={(e) => handleCopy(e.currentTarget.innerText)}>
                                        {strategy.hook || messages.leadModalScriptHookFallback}
                                    </div>
                                </div>

                                {/* Pain */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">2. The Push (Urgency)</p>
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-slate-700 cursor-pointer hover:bg-red-100 transition-colors" onClick={(e) => handleCopy(e.currentTarget.innerText)}>
                                        {strategy.pain_point_trigger || messages.leadModalScriptPainFallback}
                                    </div>
                                </div>

                                {/* Objection */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">3. Handling "Expensive"</p>
                                    <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-sm text-slate-600 italic cursor-pointer hover:bg-slate-200 transition-colors" onClick={(e) => handleCopy(e.currentTarget.innerText)}>
                                        {strategy.objection_handling || messages.leadModalScriptObjectionFallback}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions Footer */}
                            <div className="mt-auto p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl space-y-3">
                                {/* Smart WhatsApp Button */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowWaMenu(!showWaMenu)}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                                    >
                                        <MessageCircle size={18} />
                                        WhatsApp Action
                                    </button>

                                    {showWaMenu && (
                                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in slide-in-from-bottom-2 z-30">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Choose Template</div>
                                            
                                            <button onClick={() => openWa(waTemplates.care)} className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                                                <span>👋</span> {messages.leadModalWaCare}
                                            </button>
                                            <button onClick={() => openWa(waTemplates.result)} className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                                                <span>🎯</span> {messages.leadModalWaResult}
                                            </button>
                                            <button onClick={() => openWa(waTemplates.offer)} className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                                                <span>🔥</span> {messages.leadModalWaOffer}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <a href={`tel:${lead.phone}`} className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    <Phone size={18} />
                                    Call Now
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
