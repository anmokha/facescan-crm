import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Генерирует правильную ссылку на портал для конкретной клиники
 * Учитывает Custom Domain и Subdomains
 */
export async function getClinicPortalUrl(clinicId: string): Promise<string> {
  const defaultUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://curescan.pro';
  
  if (!clinicId || clinicId === 'default') {
    return `${defaultUrl}/portal`;
  }

  try {
    const clinicDoc = await adminDb.collection('clinics').doc(clinicId).get();
    
    if (!clinicDoc.exists) {
      return `${defaultUrl}/portal`;
    }

    const data = clinicDoc.data() || {};

    // 1. Приоритет: Кастомный домен (например, portal.myclinic.com)
    if (data.isCustomDomainActive && data.customDomain) {
      // Убираем протокол, если он случайно там есть, и добавляем https
      const cleanDomain = data.customDomain.replace(/^https?:\/\//, '');
      return `https://${cleanDomain}/portal`;
    }

    // 2. Поддомен (например, epilux.curescan.pro)
    if (data.slug) {
      // Получаем корневой домен из переменной окружения
      const rootDomain = defaultUrl.replace(/^https?:\/\//, '');
      
      // Если мы на localhost, поддомены работают специфично, но для продакшена:
      if (rootDomain.includes('localhost')) {
         return `${defaultUrl}/portal?client=${data.slug}`; // Fallback для локальной разработки
      }
      
      return `https://${data.slug}.${rootDomain}/portal`;
    }

    return `${defaultUrl}/portal`;

  } catch (error) {
    console.error(`Error resolving clinic URL for ${clinicId}:`, error);
    return `${defaultUrl}/portal`;
  }
}
