import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calculator, Download, UserPlus, DollarSign } from 'lucide-react';
import CategoryManager from './CategoryManager';
import AttendeeManager from './AttendeeManager';
import ExpenseCalculator from './ExpenseCalculator';
import { API_BASE_URL } from '../config/api';


const ExpenseManager = ({ eventId, onBack }) => {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('categories');

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      const data = await response.json();
      setEventData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setLoading(false);
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      const newCategory = await response.json();
      
      // Update local state
      setEventData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }));
      
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const addAttendee = async (attendeeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendeeData),
      });
      const newAttendee = await response.json();
      
      // Update local state
      setEventData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee]
      }));
      
      return newAttendee;
    } catch (error) {
      console.error('Error adding attendee:', error);
    }
  };

  const updateParticipation = async (attendeeId, categoryId, participates) => {
    try {
      await fetch(`${API_BASE_URL}/attendee-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendee_id: attendeeId,
          category_id: categoryId,
          participates
        }),
      });
      
      // Refresh data to get updated participations
      fetchEventData();
    } catch (error) {
      console.error('Error updating participation:', error);
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      const updatedCategory = await response.json();
      
      // Update local state
      setEventData(prev => ({
        ...prev,
        categories: prev.categories.map(cat => 
          cat.id === categoryId ? { ...cat, ...updatedCategory } : cat
        )
      }));
      
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      // Update local state
      setEventData(prev => ({
        ...prev,
        categories: prev.categories.filter(cat => cat.id !== categoryId)
      }));
      
      // Refresh data to update participations
      fetchEventData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const updateAttendee = async (attendeeId, attendeeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendees/${attendeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendeeData),
      });
      const updatedAttendee = await response.json();
      
      // Update local state
      setEventData(prev => ({
        ...prev,
        attendees: prev.attendees.map(att => 
          att.id === attendeeId ? { ...att, ...updatedAttendee } : att
        )
      }));
      
      return updatedAttendee;
    } catch (error) {
      console.error('Error updating attendee:', error);
    }
  };

  const deleteAttendee = async (attendeeId) => {
    try {
      await fetch(`${API_BASE_URL}/attendees/${attendeeId}`, {
        method: 'DELETE',
      });
      
      // Update local state
      setEventData(prev => ({
        ...prev,
        attendees: prev.attendees.filter(att => att.id !== attendeeId)
      }));
      
      // Refresh data to update participations
      fetchEventData();
    } catch (error) {
      console.error('Error deleting attendee:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/export`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the filename from the response headers or create a default one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'expense_report.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error exporting file:', error);
      alert('Failed to export file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <p className="text-red-600">Error loading event data</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {eventData.event.party_name}
              </h1>
              <p className="text-gray-600">
                {eventData.attendees.length} attendees • {eventData.categories.length} categories
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSection('categories')}
            className={`px-4 py-2 rounded-md flex items-center ${
              activeSection === 'categories'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Categories & Expenses
          </button>
          
          <button
            onClick={() => setActiveSection('attendees')}
            className={`px-4 py-2 rounded-md flex items-center ${
              activeSection === 'attendees'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Attendees
          </button>
          
          <button
            onClick={() => setActiveSection('calculate')}
            className={`px-4 py-2 rounded-md flex items-center ${
              activeSection === 'calculate'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate & Results
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === 'categories' && (
        <CategoryManager
          categories={eventData.categories}
          attendees={eventData.attendees}
          participations={eventData.participations}
          onAddCategory={addCategory}
          onUpdateParticipation={updateParticipation}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
        />
      )}

      {activeSection === 'attendees' && (
        <AttendeeManager
          attendees={eventData.attendees}
          onAddAttendee={addAttendee}
          onUpdateAttendee={updateAttendee}
          onDeleteAttendee={deleteAttendee}
        />
      )}

      {activeSection === 'calculate' && (
        <ExpenseCalculator
          eventId={eventId}
          eventData={eventData}
        />
      )}
    </div>
  );
};

export default ExpenseManager;