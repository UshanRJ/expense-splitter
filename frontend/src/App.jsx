import React, { useState, useEffect } from 'react';
import { PlusCircle, Users, Calculator, FileSpreadsheet, Sparkles, TrendingUp } from 'lucide-react';
import EventForm from './components/EventForm';
import ExpenseManager from './components/ExpenseManager';
import EventList from './components/EventList';
import EditEventModal from './components/EditEventModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      const newEvent = await response.json();
      setEvents([newEvent, ...events]);
      setSelectedEventId(newEvent.id);
      setActiveTab('manage');
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      const updatedEvent = await response.json();
      
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, ...updatedEvent }
          : event
      ));
      
      setEditingEvent(null);
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
      });
      
      setEvents(events.filter(event => event.id !== eventId));
      
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
        setActiveTab('events');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const selectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setActiveTab('manage');
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto absolute top-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header with Gradient */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Expense Splitter
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">
                    Split expenses fairly and effortlessly among friends
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-3 text-sm text-gray-500">
                <div className="flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Smart & Fair</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Real-time Calculations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation with Glass Morphism */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-300 ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-white/60 hover:text-gray-800 hover:scale-105'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Events
              <div className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'events' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
              }`}>
                {events.length}
              </div>
            </button>
            {selectedEventId && (
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-300 ${
                  activeTab === 'manage'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-800 hover:scale-105'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Manage Expenses
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="space-y-8">
          {activeTab === 'events' && (
            <div className="space-y-8">
              {/* Enhanced Create New Event */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
                <EventForm onCreateEvent={createEvent} />
              </div>
              
              {/* Enhanced Event List */}
              <EventList 
                events={events} 
                onSelectEvent={selectEvent}
                selectedEventId={selectedEventId}
                onEditEvent={handleEditEvent}
                onDeleteEvent={deleteEvent}
              />
            </div>
          )}

          {activeTab === 'manage' && selectedEventId && (
            <div className="transform transition-all duration-500 ease-out">
              <ExpenseManager 
                eventId={selectedEventId} 
                onBack={() => setActiveTab('events')}
              />
            </div>
          )}
        </div>

        {/* Enhanced Edit Event Modal */}
        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onSave={updateEvent}
            onCancel={() => setEditingEvent(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;