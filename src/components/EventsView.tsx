import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Video, 
  Tag, 
  Plus, 
  CheckCircle, 
  X, 
  Ticket, 
  Download, 
  Search, 
  AlertCircle, 
  QrCode, 
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { AlumniEvent, EventCategory, EventRegistration } from '../types';
import confetti from 'canvas-confetti';

export const EventsView: React.FC = () => {
  const { 
    events, 
    registrations, 
    currentUser, 
    registerForEvent, 
    cancelRegistration, 
    createEvent 
  } = useAlumni();

  // Active sub-tab
  const [subTab, setSubTab] = useState<'all' | 'my-tickets' | 'attendee-tracker'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Register modal state
  const [registeringEvent, setRegisteringEvent] = useState<AlumniEvent | null>(null);
  const [attendanceMode, setAttendanceMode] = useState<'In-Person' | 'Virtual'>('In-Person');
  const [confirmedTicket, setConfirmedTicket] = useState<{ ticketCode: string; event: AlumniEvent } | null>(null);

  // Create Event modal state
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('Tech Talk');
  const [newEventDate, setNewEventDate] = useState('2026-11-25');
  const [newEventTime, setNewEventTime] = useState('18:00 - 20:00 EST');
  const [newEventVenue, setNewEventVenue] = useState('Campus Center Hall');
  const [newEventCapacity, setNewEventCapacity] = useState('150');
  const [newEventIsVirtual, setNewEventIsVirtual] = useState(false);
  const [newEventMeetingLink, setNewEventMeetingLink] = useState('');
  const [newEventSpeakerName, setNewEventSpeakerName] = useState('');
  const [newEventSpeakerRole, setNewEventSpeakerRole] = useState('');
  const [newEventSpeakerCompany, setNewEventSpeakerCompany] = useState('');

  // Selected event filter for Attendee Tracker
  const [trackerEventId, setTrackerEventId] = useState<string>('ALL');

  // Filtered events
  const filteredEvents = events.filter(e => {
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch = !searchFilter || 
      e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // User's own registered tickets
  const myRegistrations = registrations.filter(r => 
    currentUser && (r.userId === currentUser.id || r.userEmail === currentUser.email) && r.status === 'Confirmed'
  );

  // Check if current user is registered for an event
  const isUserRegistered = (eventId: string) => {
    return myRegistrations.some(r => r.eventId === eventId);
  };

  const getTicketForEvent = (eventId: string) => {
    return myRegistrations.find(r => r.eventId === eventId);
  };

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;

    const res = registerForEvent(registeringEvent.id, attendanceMode);
    if (res.success && res.ticketCode) {
      setConfirmedTicket({
        ticketCode: res.ticketCode,
        event: registeringEvent
      });
      setRegisteringEvent(null);

      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else {
      alert(res.message);
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventVenue) return;

    createEvent({
      title: newEventTitle,
      description: newEventDesc || 'Alumni community session and networking.',
      category: newEventCategory,
      date: newEventDate,
      time: newEventTime,
      venue: newEventVenue,
      isVirtual: newEventIsVirtual,
      meetingLink: newEventMeetingLink || undefined,
      capacity: parseInt(newEventCapacity) || 100,
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      speaker: {
        name: newEventSpeakerName || currentUser?.name || 'Guest Speaker',
        role: newEventSpeakerRole || 'Industry Leader',
        company: newEventSpeakerCompany || 'Alumni Network',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
      },
      organizer: 'Alumni Relations Committee',
      tags: [newEventCategory, 'Alumni', 'Networking']
    });

    setIsCreatingEvent(false);
    // Reset inputs
    setNewEventTitle('');
    setNewEventDesc('');
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Campus & Alumni Gatherings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Upcoming Reunions, Panels & Events
          </h1>
          <p className="text-sm text-slate-300">
            Join your peers for annual reunions, masterclasses, and networking dinners. Confirm your RSVP to receive your digital event pass.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingEvent(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Host an Event</span>
        </button>
      </div>

      {/* Sub navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              subTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Browse Events ({events.length})</span>
          </button>

          <button
            onClick={() => setSubTab('my-tickets')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              subTab === 'my-tickets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Registered Passes ({myRegistrations.length})</span>
          </button>

          <button
            onClick={() => setSubTab('attendee-tracker')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              subTab === 'attendee-tracker'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Attendee Tracker (SQL Table)</span>
          </button>
        </div>

        {subTab === 'all' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Reunion">Reunion</option>
              <option value="Tech Talk">Tech Talk</option>
              <option value="Career Fair">Career Fair</option>
              <option value="Networking">Networking</option>
              <option value="Webinar">Webinar</option>
            </select>

            <input
              type="text"
              placeholder="Search events..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white w-44"
            />
          </div>
        )}
      </div>

      {/* SUB-TAB 1: BROWSE ALL EVENTS */}
      {subTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const registered = isUserRegistered(evt.id);
            const userTicket = getTicketForEvent(evt.id);
            const fillPct = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image with overlay */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {evt.category}
                      </span>
                      {evt.isVirtual && (
                        <span className="px-2 py-1 bg-blue-600/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Video className="w-3 h-3" /> Virtual Stream
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-900 rounded-lg font-mono text-[11px] font-bold shadow-xs">
                      {evt.date}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>

                    {/* Keynote Speaker */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
                      <img
                        src={evt.speaker.avatar}
                        alt={evt.speaker.name}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{evt.speaker.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{evt.speaker.role} • {evt.speaker.company}</p>
                      </div>
                    </div>

                    {/* Live Capacity Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-600 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Registration Capacity:
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {evt.registeredCount} / {evt.capacity} spots ({fillPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            fillPct > 90 ? 'bg-rose-500' : fillPct > 60 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">ID: {evt.id}</span>
                  {registered ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmedTicket({ ticketCode: userTicket!.ticketCode, event: evt })}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Pass #{userTicket?.ticketCode.slice(-5)}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Cancel your RSVP for this event?')) {
                            cancelRegistration(userTicket!.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Cancel Registration (DML DELETE)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : evt.registeredCount >= evt.capacity ? (
                    <span className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-lg text-xs font-semibold">
                      Sold Out
                    </span>
                  ) : (
                    <button
                      onClick={() => setRegisteringEvent(evt)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Register Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: MY TICKETS */}
      {subTab === 'my-tickets' && (
        <div className="space-y-4">
          {myRegistrations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No active event registrations</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't registered for any upcoming events yet. Browse the catalog to grab your pass!
              </p>
              <button
                onClick={() => setSubTab('all')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRegistrations.map((reg) => {
                const event = events.find(e => e.id === reg.eventId);
                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {reg.status}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                          {reg.eventTitle}
                        </h4>
                      </div>
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-700 font-mono text-center shrink-0">
                        <QrCode className="w-8 h-8 mx-auto text-slate-800" />
                        <span className="text-[9px] font-bold block mt-0.5">{reg.ticketCode}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p><strong>Attendee:</strong> {reg.userName} ({reg.userRole})</p>
                      <p><strong>Mode:</strong> {reg.attendanceMode}</p>
                      <p><strong>Date & Venue:</strong> {event?.date} • {event?.venue}</p>
                      <p className="text-[10px] text-slate-400">Registered at: {reg.registrationDate}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (event) setConfirmedTicket({ ticketCode: reg.ticketCode, event });
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>View Digital Boarding Pass</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Cancel this registration? This will execute a DML DELETE transaction.')) {
                            cancelRegistration(reg.id);
                          }
                        }}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel RSVP</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: ATTENDEE TRACKER (SQL RELATIONAL REPORT) */}
      {subTab === 'attendee-tracker' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Live Event Registration Tracker (Relational Junction Table)
              </h3>
              <p className="text-xs text-slate-500">
                Corresponds to: <code>SELECT * FROM event_registrations INNER JOIN alumni_events ...</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filter by Event:</span>
              <select
                value={trackerEventId}
                onChange={(e) => setTrackerEventId(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">All Events ({registrations.length} registrations)</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title.slice(0, 30)}... ({e.registeredCount})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Ticket Code</th>
                  <th className="py-2.5 px-3">Event Title</th>
                  <th className="py-2.5 px-3">Attendee Name</th>
                  <th className="py-2.5 px-3">User Role</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Registered At</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {registrations
                  .filter(r => trackerEventId === 'ALL' || r.eventId === trackerEventId)
                  .map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                        {reg.ticketCode}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">
                        {reg.eventTitle}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{reg.userName}</div>
                        <div className="text-[10px] text-slate-400">{reg.userEmail}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {reg.userRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{reg.attendanceMode}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
                        {reg.registrationDate}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove attendee ${reg.userName}? Executes DML DELETE.`)) {
                              cancelRegistration(reg.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Confirm Event RSVP</h3>
                <p className="text-xs text-blue-100">{registeringEvent.title}</p>
              </div>
              <button onClick={() => setRegisteringEvent(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRegistration} className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/60 space-y-1">
                <p><strong>Date & Time:</strong> {registeringEvent.date} ({registeringEvent.time})</p>
                <p><strong>Venue:</strong> {registeringEvent.venue}</p>
                <p><strong>Attendee:</strong> {currentUser?.name} ({currentUser?.email})</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select Attendance Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceMode('In-Person')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      attendanceMode === 'In-Person'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span>In-Person Campus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceMode('Virtual')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      attendanceMode === 'Virtual'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                    <span>Live Stream</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px]">
                <span className="text-slate-400"># Atomic DML Transaction:</span><br />
                <span className="text-emerald-400">BEGIN TRANSACTION; INSERT INTO event_registrations ...; UPDATE alumni_events ...; COMMIT;</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegisteringEvent(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Confirm & Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL BOARDING PASS / TICKET MODAL */}
      {confirmedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Ticket Styling */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white text-center relative">
              <button
                onClick={() => setConfirmedTicket(null)}
                className="absolute top-4 right-4 p-1 text-white/80 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                Official Event Access Pass
              </span>
              <h3 className="text-base font-extrabold mt-2 leading-tight">
                {confirmedTicket.event.title}
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                {confirmedTicket.event.date} • {confirmedTicket.event.time}
              </p>
            </div>

            {/* Perforated separator */}
            <div className="relative bg-white py-1">
              <div className="border-b-2 border-dashed border-slate-200" />
              <div className="w-5 h-5 bg-slate-900 rounded-full absolute -left-2.5 -top-2.5" />
              <div className="w-5 h-5 bg-slate-900 rounded-full absolute -right-2.5 -top-2.5" />
            </div>

            {/* Ticket Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ticket Holder</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{currentUser?.role}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Venue / Room</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{confirmedTicket.event.venue}</p>
                </div>
              </div>

              {/* Barcode & Code */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                <QrCode className="w-20 h-20 mx-auto text-slate-900" />
                <p className="font-mono text-sm font-extrabold text-blue-700 tracking-wider">
                  {confirmedTicket.ticketCode}
                </p>
                <p className="text-[10px] text-slate-400">Scan at entrance terminal for instant attendance check-in</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const ticketData = `ALUMNICONNECT PASS\nCode: ${confirmedTicket.ticketCode}\nEvent: ${confirmedTicket.event.title}\nAttendee: ${currentUser?.name}\nDate: ${confirmedTicket.event.date}\nVenue: ${confirmedTicket.event.venue}`;
                    const blob = new Blob([ticketData], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pass_${confirmedTicket.ticketCode}.txt`;
                    a.click();
                    setConfirmedTicket(null);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pass (.txt)</span>
                </button>
                <button
                  onClick={() => setConfirmedTicket(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Host New Alumni Event</h3>
                <p className="text-xs text-slate-400">Executes DML INSERT into `alumni_events`</p>
              </div>
              <button onClick={() => setIsCreatingEvent(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-1">
              <button
                type="button"
                onClick={() => {
                  setNewEventTitle('Frontier AI & Cloud Infrastructure Alumni Panel 2026');
                  setNewEventCategory('Tech Talk');
                  setNewEventCapacity('150');
                  setNewEventDate('2026-11-20');
                  setNewEventTime('18:00 - 20:00 EST');
                  setNewEventVenue('Grand Alumni Auditorium & Virtual Live Stream');
                  setNewEventSpeakerName('Dr. Sarah Chen');
                  setNewEventSpeakerRole('Staff Software Engineer');
                  setNewEventSpeakerCompany('Google Cloud');
                  setNewEventDesc('Annual keynote discussing hyperscale distributed systems, careers in cloud infrastructure, and student mentorship Q&A.');
                }}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>✨ Autofill Sample Event Data</span>
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="p-6 pt-3 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Annual Alumni Gala 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as EventCategory)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tech Talk">Tech Talk</option>
                    <option value="Reunion">Reunion</option>
                    <option value="Networking">Networking</option>
                    <option value="Career Fair">Career Fair</option>
                    <option value="Webinar">Webinar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Capacity *</label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    required
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="18:00 - 20:00 EST"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / Location *</label>
                <input
                  type="text"
                  required
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  placeholder="Main University Auditorium or Zoom"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Speaker Name</label>
                  <input
                    type="text"
                    value={newEventSpeakerName}
                    onChange={(e) => setNewEventSpeakerName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    className="w-full p-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Speaker Role</label>
                  <input
                    type="text"
                    value={newEventSpeakerRole}
                    onChange={(e) => setNewEventSpeakerRole(e.target.value)}
                    placeholder="VP Engineering"
                    className="w-full p-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Speaker Org</label>
                  <input
                    type="text"
                    value={newEventSpeakerCompany}
                    onChange={(e) => setNewEventSpeakerCompany(e.target.value)}
                    placeholder="Meta"
                    className="w-full p-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Brief agenda and details..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingEvent(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Create Event (INSERT)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
