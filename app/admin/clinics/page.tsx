import { getAllClinics } from '@/lib/adminService'
import ClinicsManager from '@/components/admin/ClinicsManager'

export default async function AdminClinicsPage() {
  const clinics = await getAllClinics();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <ClinicsManager initialClinics={clinics} />
      </div>
    </div>
  )
}
