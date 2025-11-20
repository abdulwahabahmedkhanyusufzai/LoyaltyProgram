import {getRequestConfig} from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookie, fallback to 'en'
  const cookieStore = await cookies();
  const userLanguage = cookieStore.get('userLanguage')?.value || 'en';
  
  // Map "English" and "French" to locale codes
  const locale = userLanguage.toLowerCase() === 'french' ? 'fr' : 'en';
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});