import AuditLogViewer from '@/components/admin/AuditLogViewer';

export default function AuditLogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <AuditLogViewer />
      </div>
    </div>
  );
}
