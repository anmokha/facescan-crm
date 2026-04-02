'use client';

import { useState } from 'react';
import { ClinicAIStats, ActionBreakdown } from '@/lib/admin/aiStatsService';
import { Building2, ChevronDown, ChevronRight, Stethoscope, Wrench, Globe } from 'lucide-react';

interface ClinicsTableProps {
  clinics: ClinicAIStats[];
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatCost(cost: number): string {
  if (cost < 0.01) {
    return '< $0.01';
  }
  return '$' + cost.toFixed(2);
}

function ActionBreakdownRow({ 
  title, 
  icon: Icon, 
  data, 
  color 
}: { 
  title: string; 
  icon: React.ElementType; 
  data: ActionBreakdown; 
  color: string;
}) {
  if (data.requests === 0) return null;
  
  return (
    <tr className="bg-gray-50/50">
      <td className="px-6 py-3 pl-12" colSpan={3}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm text-gray-600">{title}</span>
        </div>
      </td>
      <td className="px-6 py-3 text-right text-sm text-gray-600">
        {data.requests}
      </td>
      <td className="px-6 py-3 text-right text-sm text-gray-600">
        {formatNumber(data.inputTokens)}
      </td>
      <td className="px-6 py-3 text-right text-sm text-gray-600">
        {formatNumber(data.outputTokens)}
      </td>
      <td className="px-6 py-3 text-right text-sm font-medium text-gray-700">
        {formatNumber(data.totalTokens)}
      </td>
      <td className="px-6 py-3 text-right">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {formatCost(data.estimatedCost)}
        </span>
      </td>
    </tr>
  );
}

function ClinicRow({ clinic }: { clinic: ClinicAIStats }) {
  const [expanded, setExpanded] = useState(false);
  const hasBreakdown = clinic.checkups.requests > 0 || clinic.service.requests > 0;
  
  return (
    <>
      <tr 
        className={`hover:bg-gray-50 transition-colors ${hasBreakdown ? 'cursor-pointer' : ''}`}
        onClick={() => hasBreakdown && setExpanded(!expanded)}
      >
        {/* Expand button + Name */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {hasBreakdown && (
              <button 
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            {!hasBreakdown && <div className="w-6" />}
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">
              {clinic.clinicName || '—'}
            </span>
          </div>
        </td>
        
        {/* Slug / Address */}
        <td className="px-6 py-4">
          {clinic.slug ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              <span>{clinic.slug}.curescan.pro</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </td>
        
        {/* ID */}
        <td className="px-6 py-4">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
            {clinic.clinicId}
          </code>
        </td>
        
        {/* Stats */}
        <td className="px-6 py-4 text-right text-gray-700">
          {clinic.requests}
        </td>
        <td className="px-6 py-4 text-right text-gray-700">
          {formatNumber(clinic.inputTokens)}
        </td>
        <td className="px-6 py-4 text-right text-gray-700">
          {formatNumber(clinic.outputTokens)}
        </td>
        <td className="px-6 py-4 text-right font-medium text-gray-900">
          {formatNumber(clinic.totalTokens)}
        </td>
        <td className="px-6 py-4 text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {formatCost(clinic.estimatedCost)}
          </span>
        </td>
      </tr>
      
      {expanded && hasBreakdown && (
        <>
          <ActionBreakdownRow
            title="Чекапы (Checkups)"
            icon={Stethoscope}
            data={clinic.checkups}
            color="text-blue-500"
          />
          <ActionBreakdownRow
            title="Сервис (Website Crawl)"
            icon={Wrench}
            data={clinic.service}
            color="text-orange-500"
          />
        </>
      )}
    </>
  );
}

export function ClinicsTable({ clinics }: ClinicsTableProps) {
  if (clinics.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет данных по клиникам за выбранный период</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Использование по клиникам
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Топ {clinics.length} клиник по потреблению токенов. Нажмите на строку для детализации.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-semibold">Название</th>
              <th className="px-6 py-3 font-semibold">Адрес (Slug)</th>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold text-right">Запросы</th>
              <th className="px-6 py-3 font-semibold text-right">Input</th>
              <th className="px-6 py-3 font-semibold text-right">Output</th>
              <th className="px-6 py-3 font-semibold text-right">Всего</th>
              <th className="px-6 py-3 font-semibold text-right">$</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clinics.map((clinic) => (
              <ClinicRow key={clinic.clinicId} clinic={clinic} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
