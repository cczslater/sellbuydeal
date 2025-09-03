// app/product/[id]/page.tsx
import AdminTicketDetailClient from './AdminTicketDetailClient';
import { getTicket } from '@/lib/db'; // server-side fetch

export async function generateStaticParams() {
  const tickets = await getTicket();
  return tickets.map(t => ({ id: t.id.toString() }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const ticket = await getTicket(params.id); // fetch on server

  return <AdminTicketDetailClient initialTicket={ticket} />;
}
