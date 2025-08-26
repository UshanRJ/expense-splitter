import React, { useState } from 'react';
import { Calendar, Users, ArrowRight, Edit, Trash2, Sparkles, Clock, PartyPopper } from 'lucide-react';

const EventList = ({ events, onSelectEvent, selectedEventId, onEditEvent, onDeleteEvent }) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getDaysFromNow = (dateString) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 0) return `In ${diffDays} days`;
      return `${Math.abs(diffDays)} days ago`;
    } catch {
      return '';
    }
  };

  const getEventCardGradient = (index) => {
    const gradients = [
      'from-blue-400 to-purple-600',
      'from-green-400 to-blue-600',
      'from-purple-400 to-pink-600',
      'from-yellow-400 to-orange-600',
      'from-pink-400 to-red-600',
      'from-indigo-400 to-purple-600'
    ];
    return gradients[index % gradients.length];
  };

  const handleDelete = (eventId) => {
    setDeletingEvent(eventId);
    if (window.confirm('Are you sure you want to delete this event? This will delete all categories, attendees, and calculations.')) {
      onDeleteEvent(eventId);
    }
    setDeletingEvent(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Events</h2>
              <p className="text-gray-600">Manage and track your party expenses</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-gray-700">{events.length} Events</span>
          </div>
        </div>
      </div>
      
      {events.length === 0 ? (
        <div className="p-12 text-center">
          <div className="relative mb-6">
            <PartyPopper className="w-20 h-20 text-gray-300 mx-auto animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">No events yet</h3>
          <p className="text-gray-500 text-lg mb-6">Create your first party event to get started!</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Start splitting expenses in minutes</span>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid gap-6">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`relative group cursor-pointer transition-all duration-500 transform ${
                  selectedEventId === event.id 
                    ? 'scale-105 ring-4 ring-blue-500/20' 
                    : 'hover:scale-102'
                } ${
                  deletingEvent === event.id ? 'animate-pulse opacity-50' : ''
                }`}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* Card Background with Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getEventCardGradient(index)} opacity-10 rounded-2xl transition-opacity duration-300 ${
                  hoveredEvent === event.id ? 'opacity-20' : ''
                }`}></div>
                
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => onSelectEvent(event.id)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 bg-gradient-to-r ${getEventCardGradient(index)} rounded-xl shadow-md`}>
                          <PartyPopper className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors duration-300">
                            {event.party_name}
                          </h3>
                          {selectedEventId === event.id && (
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-blue-600 font-medium">Currently Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="flex items-center space-x-2 bg-blue-50 rounded-full px-3 py-1">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-blue-700">
                              {formatDate(event.party_date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 bg-green-50 rounded-full px-3 py-1">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-green-700">
                              {getDaysFromNow(event.party_date)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Created on {formatDateTime(event.created_at)}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div 
                        className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-all duration-300 p-2 hover:bg-blue-50 rounded-xl cursor-pointer group"
                        onClick={() => onSelectEvent(event.id)}
                      >
                        <span className="text-sm font-medium">Manage</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Indicator */}
                  {hoveredEvent === event.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;