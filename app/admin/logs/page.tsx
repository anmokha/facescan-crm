import { adminDb } from '@/lib/firebaseAdmin';
import PageHeader from '@/components/admin/PageHeader';
import { Activity, Clock } from 'lucide-react';

export default async function AILogsPage() {
    let logs: any[] = [];
    try {
        const snapshot = await adminDb.collection('usage_logs')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate().toLocaleString()
        }));
    } catch (e) {
        console.error("Error fetching AI logs:", e);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8 max-w-7xl mx-auto">
                <PageHeader
                    title="AI Usage Logs"
                    description="Monitor token consumption and API calls in real-time"
                    breadcrumbs={[{ label: 'AI Logs' }]}
                    icon={<Activity className="text-blue-600" size={24} />}
                />

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider bg-gray-50">
                                <th className="px-6 py-4 font-semibold">Timestamp</th>
                                <th className="px-6 py-4 font-semibold">Clinic ID</th>
                                <th className="px-6 py-4 font-semibold">Model</th>
                                <th className="px-6 py-4 font-semibold text-right">Tokens (In/Out)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-700 text-sm font-mono flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        {log.timestamp}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {log.clinicId === 'default'
                                            ? <span className="text-gray-500 italic">Default Demo</span>
                                            : log.clinicId
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200 font-medium">
                                            {log.model}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <span className="text-gray-600">{log.inputTokens}</span>
                                        <span className="text-gray-400 mx-1">/</span>
                                        <span className="text-green-600 font-medium">{log.outputTokens}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {logs.length === 0 && (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <Activity size={48} className="mb-4 opacity-30" />
                            <p>No AI usage logs found yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
