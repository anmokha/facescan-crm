'use client'

import { useState } from 'react'
import { LogIn, Loader2 } from 'lucide-react'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/diagnostic/firebaseConfig'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'

export default function ImpersonateButton({ clinicId }: { clinicId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { user } = useAuth()

    const handleImpersonate = async () => {
        if (!confirm('Вы уверены, что хотите войти под этим клиентом? Ваша текущая сессия будет завершена.')) return;

        setLoading(true);
        try {
            // Get fresh ID token
            const idToken = await user!.getIdToken(true);

            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    targetUid: clinicId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Impersonation failed');
            }

            const data = await res.json();

            if (data.token) {
                await signInWithCustomToken(auth, data.token);
                // Force reload to clear any admin state and load dashboard
                window.location.href = '/dashboard?impersonated=true';
            } else {
                throw new Error('No token received');
            }
        } catch (e: any) {
            console.error(e);
            alert('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button 
            onClick={handleImpersonate}
            disabled={loading}
            className="p-2 hover:bg-blue-900/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors border border-transparent hover:border-blue-800"
            title="Log in as this Clinic"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
        </button>
    )
}
