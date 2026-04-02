import { getAllClinics } from '@/lib/adminService'
import TdsManager from '@/components/admin/TdsManager'

export default async function AdminTdsPage() {
  const prospects = await getAllClinics('prospect');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <TdsManager initialProspects={prospects} />
    </div>
  )
}
