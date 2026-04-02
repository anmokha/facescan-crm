import { getClinicStats } from '@/lib/adminService'
import { adminDb } from '@/lib/firebaseAdmin'
import { Users, Activity, PieChart } from 'lucide-react'
import RevenueStats from '@/components/admin/RevenueStats'
import PageHeader from '@/components/admin/PageHeader'

export default async function AdminClinicDashboard({ params }: { params: { id: string } }) {
    const stats = await getClinicStats(params.id);

    if (!stats) return <div className="p-8 text-gray-500">Failed to load stats.</div>;

    // Get clinic settings for estimated average check
    const clinicDoc = await adminDb.collection('clinics').doc(params.id).get();
    const clinicData = clinicDoc.data();
    const estimatedAverageCheck = clinicData?.estimatedAverageCheck || 5000; // Default to 5000 if not set

    const estimatedRevenue = stats.converted * estimatedAverageCheck;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8 max-w-7xl mx-auto">
                <PageHeader
                    title="Performance Overview"
                    description="Clinic performance metrics and analytics"
                    breadcrumbs={[
                        { label: 'Clinics', href: '/admin/clinics' },
                        { label: 'Dashboard' }
                    ]}
                    icon={<Activity className="text-blue-600" size={24} />}
                />

            {/* Revenue Stats (NEW) */}
            <div className="mb-8">
                <RevenueStats
                    totalRevenue={stats.revenue}
                    convertedCount={stats.converted}
                    totalLeads={stats.totalLeads}
                    estimatedRevenue={estimatedRevenue}
                    averageCheck={estimatedAverageCheck}
                />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="text-blue-600" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalLeads}</div>
                    <div className="text-sm text-gray-600 mt-1">{stats.newLeads} new</div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Activity className="text-purple-600" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversion</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</div>
                    <div className="text-sm text-gray-600 mt-1">{stats.converted} sales</div>
                </div>
            </div>

            {/* Sources & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChart size={18} className="text-gray-600" /> Top Traffic Sources
                    </h3>
                    <div className="space-y-4">
                        {stats.topSources.map(([source, count], idx) => (
                            <div key={source} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-xs font-mono">{idx + 1}</span>
                                    <span className="text-gray-900 font-medium">{source}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${(count / stats.totalLeads) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-gray-900 font-bold text-sm">{count}</span>
                                </div>
                            </div>
                        ))}
                        {stats.topSources.length === 0 && (
                            <p className="text-gray-500 text-sm">No data yet.</p>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
