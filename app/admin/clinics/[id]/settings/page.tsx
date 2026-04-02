import ClinicSettingsForm from '@/components/admin/ClinicSettingsForm'
import PageHeader from '@/components/admin/PageHeader'

export default async function AdminClinicSettingsPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8 max-w-7xl mx-auto">
                <PageHeader
                    title="Clinic Settings"
                    description="Manage clinic configuration, services, and branding"
                    icon={null}
                />
                <ClinicSettingsForm clinicId={params.id} isAdminMode={true} />
            </div>
        </div>
    )
}
