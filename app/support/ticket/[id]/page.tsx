export const dynamic = 'force-dynamic';

import SupportTicketDetailClient from './SupportTicketDetailClient';
import { getCurrentAdmin } from '../../../../lib/admin-auth';

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  // If you have ticket IDs to pre-render, list them here.
  // Example:
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function SupportTicketPage({ params }: PageProps) {
  // Optionally fetch server-side data here if needed
  // You can also verify admin authentication if required
  const admin = await getCurrentAdmin();

  return <SupportTicketDetailClient params={params} />;
}
