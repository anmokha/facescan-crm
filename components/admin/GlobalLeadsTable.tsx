'use client'

import React, { useState } from 'react'
import { Phone, Mail, Tag, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import LeadDetailsModal from './LeadDetailsModal'

interface GlobalLeadsTableProps {
    leads: any[];
    nextCursor?: string;
    hasMore: boolean;
    selectedClinic: string;
}

export default function GlobalLeadsTable({ leads, nextCursor, hasMore, selectedClinic }: GlobalLeadsTableProps) {
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleNextPage = () => {
        if (!hasMore || !nextCursor) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('cursor', nextCursor);
        if (selectedClinic !== 'all') {
            params.set('clinic', selectedClinic);
        }
        router.push(`/admin/leads?${params.toString()}`);
    };

    const handlePreviousPage = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('cursor'); // Go back to first page
        if (selectedClinic !== 'all') {
            params.set('clinic', selectedClinic);
        }
        router.push(`/admin/leads?${params.toString()}`);
    };

    const currentCursor = searchParams.get('cursor');

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider bg-gray-50">
                            <th className="px-6 py-4 font-semibold">Lead Info</th>
                            <th className="px-6 py-4 font-semibold">Clinic</th>
                            <th className="px-6 py-4 font-semibold">Type</th>
                            <th className="px-6 py-4 font-semibold text-right">Date</th>
                            <th className="px-6 py-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => setSelectedLead(lead)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-gray-900 font-bold group-hover:text-blue-600 transition-colors">
                                            <Phone size={14} className="text-blue-600" />
                                            {lead.phone}
                                        </div>
                                        {lead.email && (
                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                <Mail size={12} />
                                                {lead.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">
                                            {lead.clinicName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Tag size={14} className="text-purple-600" />
                                        {lead.diagnosticType}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <div className="text-gray-900 text-sm font-mono">
                                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="text-gray-500 text-[10px]">
                                            {lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {leads.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No leads found.
                    </div>
                )}

                {/* Pagination Controls */}
                {leads.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="text-sm text-gray-600">
                            Showing {leads.length} leads
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={!currentCursor}
                                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={!hasMore}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedLead && (
                <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
            )}
        </>
    )
}
