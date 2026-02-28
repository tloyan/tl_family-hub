import type { Metadata } from 'next';
import { HouseholdDashboard } from '@/features/household/components/household-dashboard';

export const metadata: Metadata = {
  title: 'Mon foyer — Family Hub',
};

export default function HouseholdPage() {
  return <HouseholdDashboard />;
}
