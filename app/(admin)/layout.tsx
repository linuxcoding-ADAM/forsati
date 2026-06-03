import '@/app/globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata = {
  title: 'Admin | Forsati ODEJ',
  description: 'Admin dashboard — restricted access',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-background text-gray-100">
        {children}
      </div>
    </AppProviders>
  );
}
