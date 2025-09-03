'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SupportTicket {
  id: number;
  ticket_number: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
  subject: string;
  message: string;
  priority: 'low' | 'standard' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  assigned_to?: string;
  assigned_staff?: {
    id: string;
    name: string;
    avatar: string;
  };
  created_at: string;
  updated_at: string;
  last_reply?: string;
  reply_count: number;
}

interface SupportStaff {
  id: string;
  name: string;
  avatar: string;
  title: string;
  active_tickets: number;
  total_tickets: number;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [supportStaff, setSupportStaff] = useState<SupportStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      // Mock support tickets data
      const mockTickets: SupportTicket[] = [
        {
          id: 1,
          ticket_number: 'TK-2024-001',
          user_name: 'John Smith',
          user_email: 'john.smith@email.com',
          user_avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20headshot%20business%20casual%20clean%20background&width=100&height=100&seq=user1&orientation=squarish',
          subject: 'Unable to upload product images',
          message: 'I\'m having trouble uploading images to my product listing...',
          priority: 'high',
          status: 'open',
          category: 'Technical Problems',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          reply_count: 3
        },
        {
          id: 2,
          ticket_number: 'TK-2024-002',
          user_name: 'Sarah Johnson',
          user_email: 'sarah.j@email.com',
          user_avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%20business%20casual%20clean%20background&width=100&height=100&seq=user2&orientation=squarish',
          subject: 'Payment not processed',
          message: 'My payment was deducted but order shows pending...',
          priority: 'critical',
          status: 'in_progress',
          category: 'Payment & Billing',
          assigned_to: 'staff_001',
          assigned_staff: {
            id: 'staff_001',
            name: 'Sarah Wilson',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20customer%20support%20representative%20woman%20smiling%20friendly%20headshot%20clean%20background&width=100&height=100&seq=support1&orientation=squarish'
          },
          created_at: '2024-01-14T16:20:00Z',
          updated_at: '2024-01-15T09:15:00Z',
          last_reply: '2024-01-15T09:15:00Z',
          reply_count: 2
        },
        {
          id: 3,
          ticket_number: 'TK-2024-003',
          user_name: 'Mike Davis',
          user_email: 'mike.davis@email.com',
          user_avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20headshot%20business%20casual%20clean%20background&width=100&height=100&seq=user3&orientation=squarish',
          subject: 'Account verification issue',
          message: 'Submitted documents for verification 3 days ago...',
          priority: 'standard',
          status: 'resolved',
          category: 'Account Issues',
          assigned_to: 'staff_002',
          assigned_staff: {
            id: 'staff_002',
            name: 'David Chen',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20customer%20support%20representative%20man%20friendly%20headshot%20clean%20background&width=100&height=100&seq=support2&orientation=squarish'
          },
          created_at: '2024-01-12T09:15:00Z',
          updated_at: '2024-01-13T11:45:00Z',
          last_reply: '2024-01-13T11:45:00Z',
          reply_count: 4
        },
        {
          id: 4,
          ticket_number: 'TK-2024-004',
          user_name: 'Emma Wilson',
          user_email: 'emma.w@email.com',
          user_avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20headshot%20business%20casual%20clean%20background&width=100&height=100&seq=user4&orientation=squarish',
          subject: 'Feature request: Bulk listing import',
          message: 'Would like to request a bulk import feature...',
          priority: 'low',
          status: 'open',
          category: 'Feature Request',
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-10T14:30:00Z',
          reply_count: 0
        }
      ];

      // Mock support staff data
      const mockStaff: SupportStaff[] = [
        {
          id: 'staff_001',
          name: 'Sarah Wilson',
          avatar: 'https://readdy.ai/api/search-image?query=professional%20customer%20support%20representative%20woman%20smiling%20friendly%20headshot%20clean%20background&width=100&height=100&seq=support1&orientation=squarish',
          title: 'Senior Support Specialist',
          active_tickets: 8,
          total_tickets: 156
        },
        {
          id: 'staff_002',
          name: 'David Chen',
          avatar: 'https://readdy.ai/api/search-image?query=professional%20customer%20support%20representative%20man%20friendly%20headshot%20clean%20background&width=100&height=100&seq=support2&orientation=squarish',
          title: 'Technical Support Lead',
          active_tickets: 6,
          total_tickets: 134
        },
        {
          id: 'staff_003',
          name: 'Lisa Rodriguez',
          avatar: 'https://readdy.ai/api/search-image?query=professional%20customer%20support%20representative%20woman%20friendly%20headshot%20clean%20background&width=100&height=100&seq=support3&orientation=squarish',
          title: 'Customer Success Manager',
          active_tickets: 4,
          total_tickets: 98
        }
      ];

      setTickets(mockTickets);
      setSupportStaff(mockStaff);
    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = (staffId: string) => {
    if (!selectedTicket) return;

    const staff = supportStaff.find(s => s.id === staffId);
    if (!staff) return;

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            assigned_to: staffId,
            assigned_staff: {
              id: staff.id,
              name: staff.name,
              avatar: staff.avatar
            },
            status: 'in_progress' as const
          }
        : ticket
    ));

    setAssignModalOpen(false);
    setSelectedTicket(null);
    alert(`Ticket assigned to ${staff.name} successfully`);
  };

  const handleStatusChange = (ticketId: number, newStatus: string) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: newStatus as any, updated_at: new Date().toISOString() }
        : ticket
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'standard': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-purple-600 bg-purple-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'unassigned' && !ticket.assigned_to) ||
                         ticket.status === activeFilter ||
                         ticket.priority === activeFilter;
    
    const matchesSearch = searchQuery === '' ||
                         ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length,
    unassigned: tickets.filter(t => !t.assigned_to).length,
    critical: tickets.filter(t => t.priority === 'critical').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Desk Management</h1>
            <p className="text-gray-600">Manage customer support tickets and assignments</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/support/staff"
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap"
            >
              Manage Staff
            </Link>
            <Link
              href="/admin/support/settings"
              className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{ticketStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-ticket-line text-xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Tickets</p>
                <p className="text-2xl font-bold text-green-600">{ticketStats.open}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-chat-check-line text-xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unassigned</p>
                <p className="text-2xl font-bold text-orange-600">{ticketStats.unassigned}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-user-unfollow-line text-xl text-orange-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Critical Priority</p>
                <p className="text-2xl font-bold text-red-600">{ticketStats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alarm-warning-line text-xl text-red-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Support Staff Overview */}
        <div className="bg-white rounded-2xl shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Support Team</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportStaff.map(staff => (
                <div key={staff.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-full object-cover object-top"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{staff.name}</h4>
                    <p className="text-sm text-gray-600">{staff.title}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {staff.active_tickets} active
                      </span>
                      <span className="text-xs text-gray-500">
                        {staff.total_tickets} total
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {[
                { key: 'all', label: 'All' },
                { key: 'unassigned', label: 'Unassigned' },
                { key: 'open', label: 'Open' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'critical', label: 'Critical' },
                { key: 'high', label: 'High Priority' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === filter.key
                      ? 'bg-[#004080] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  {filter.key !== 'all' && (
                    <span className="ml-1">
                      ({filter.key === 'unassigned' ? ticketStats.unassigned :
                        filter.key === 'critical' ? ticketStats.critical :
                        filter.key === 'open' ? tickets.filter(t => t.status === 'open').length :
                        filter.key === 'in_progress' ? tickets.filter(t => t.status === 'in_progress').length :
                        filter.key === 'high' ? tickets.filter(t => t.priority === 'high').length : 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={ticket.user_avatar}
                        alt={ticket.user_name}
                        className="w-12 h-12 rounded-full object-cover object-top"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Link
                            href={`/admin/support/ticket/${ticket.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                          >
                            {ticket.subject}
                          </Link>
                          <span className="text-sm text-gray-500">#{ticket.ticket_number}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>{ticket.user_name}</span>
                          <span>{ticket.user_email}</span>
                          <span>{ticket.category}</span>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ticket.message}</p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                          <span>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                          <span>{ticket.reply_count} replies</span>
                          {ticket.last_reply && (
                            <span>Last reply: {new Date(ticket.last_reply).toLocaleDateString()}</span>
                          )}
                        </div>

                        {ticket.assigned_staff && (
                          <div className="flex items-center space-x-2 mt-2">
                            <img
                              src={ticket.assigned_staff.avatar}
                              alt={ticket.assigned_staff.name}
                              className="w-6 h-6 rounded-full object-cover object-top"
                            />
                            <span className="text-sm text-blue-600">
                              Assigned to {ticket.assigned_staff.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!ticket.assigned_to && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setAssignModalOpen(true);
                          }}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                        >
                          Assign
                        </button>
                      )}
                      
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>

                      <Link
                        href={`/admin/support/ticket/${ticket.id}`}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-ticket-line text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No tickets found' : 'No tickets match your filters'}
                </h4>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Try adjusting your search query'
                    : 'Try changing your filter settings to see more tickets'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Assign Ticket</h3>
                <button
                  onClick={() => {
                    setAssignModalOpen(false);
                    setSelectedTicket(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Ticket #{selectedTicket.ticket_number}</h4>
                <p className="text-gray-600 text-sm">{selectedTicket.subject}</p>
                <p className="text-gray-500 text-xs mt-1">By {selectedTicket.user_name}</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Select Support Staff:</h5>
                {supportStaff.map(staff => (
                  <button
                    key={staff.id}
                    onClick={() => handleAssignTicket(staff.id)}
                    className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-10 h-10 rounded-full object-cover object-top"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900">{staff.name}</h4>
                      <p className="text-sm text-gray-600">{staff.title}</p>
                      <p className="text-xs text-gray-500">{staff.active_tickets} active tickets</p>
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </button>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setAssignModalOpen(false);
                    setSelectedTicket(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}