'use client';
import { useState, useEffect } from 'react';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../components/AuthProvider';
import Link from 'next/link';

interface TicketReply {
  id: number;
  user_type: 'user' | 'support';
  user_name: string;
  user_avatar: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  message: string;
  priority: 'low' | 'standard' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  assigned_staff?: { name: string; avatar: string; title: string };
  attachments?: string[];
  created_at: string;
  updated_at: string;
  replies: TicketReply[];
}

export default function SupportTicketDetailClient({ params }: { params: { id: string } }) {
  const { user, profile } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Mock ticket data
      const mockTicket: SupportTicket = {
        id: parseInt(params.id),
        ticket_number: 'TK-2024-001',
        subject: 'Sample Ticket Subject',
        message: 'This is a sample message for the ticket.',
        priority: 'high',
        status: 'in_progress',
        category: 'Technical',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        replies: []
      };
      setTicket(mockTicket);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, params.id]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view this ticket.</div>;
  if (!ticket) return <div>Ticket not found.</div>;

  return (
    <div>
      <Header />
      <div>
        <h1>Ticket #{ticket.ticket_number}</h1>
        <p>{ticket.subject}</p>
        <p>{ticket.message}</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type a reply..."
          />
          <button type="submit">Send Reply</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
