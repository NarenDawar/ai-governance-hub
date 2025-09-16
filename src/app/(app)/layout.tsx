import AppHeader from '../../components/AppHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main>
        {children}
      </main>
    </div>
  );
}