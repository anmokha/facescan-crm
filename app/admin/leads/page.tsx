import { getAllLeads, getAllClinics } from '@/lib/adminService'
import GlobalLeadsTable from '@/components/admin/GlobalLeadsTable'
import LeadFilter from './LeadFilter'
import PageHeader from '@/components/admin/PageHeader'
import { Users } from 'lucide-react'

export default async function GlobalLeadsPage({
    searchParams,
}: {
    searchParams: { clinic?: string; cursor?: string; limit?: string }
}) {
    const selectedClinic = searchParams.clinic || 'all';
    const cursor = searchParams.cursor;
    const limit = parseInt(searchParams.limit || '50', 10);

    const result = await getAllLeads(selectedClinic, limit, cursor);
    const clinics = await getAllClinics();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8 max-w-7xl mx-auto">
                <PageHeader
                    title="Leads"
                    description="Real-time stream of all diagnostic results across the platform"
                    breadcrumbs={[{ label: 'Leads' }]}
                    icon={<Users className="text-blue-600" size={24} />}
                    actions={<LeadFilter clinics={clinics} />}
                />

                <GlobalLeadsTable
                    leads={result.leads}
                    nextCursor={result.nextCursor}
                    hasMore={result.hasMore}
                    selectedClinic={selectedClinic}
                />
            </div>
        </div>
    )
}
