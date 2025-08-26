import React, { useState } from 'react';
import { Plus, UserPlus, Users, DollarSign, Check, X, Edit, Trash2 } from 'lucide-react';

const AttendeeManager = ({ attendees, onAddAttendee, onUpdateAttendee, onDeleteAttendee }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [newAttendee, setNewAttendee] = useState({
    name: '',
    contribution: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAttendee.name) return;

    try {
      await onAddAttendee({
        name: newAttendee.name,
        contribution: parseFloat(newAttendee.contribution || 0)
      });
      
      setNewAttendee({ name: '', contribution: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding attendee:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAttendee.name) return;

    try {
      if (onUpdateAttendee) {
        await onUpdateAttendee(editingAttendee.id, {
          name: editingAttendee.name,
          contribution: parseFloat(editingAttendee.contribution || 0)
        });
      }
      
      setEditingAttendee(null);
    } catch (error) {
      console.error('Error updating attendee:', error);
    }
  };

  const handleDelete = async (attendeeId) => {
    if (window.confirm('Are you sure you want to delete this attendee? This will also remove all their participation data.')) {
      try {
        if (onDeleteAttendee) {
          await onDeleteAttendee(attendeeId);
        }
      } catch (error) {
        console.error('Error deleting attendee:', error);
      }
    }
  };

  const startEdit = (attendee) => {
    setEditingAttendee({
      id: attendee.id,
      name: attendee.name,
      contribution: attendee.contribution || 0
    });
  };

  const cancelEdit = () => {
    setEditingAttendee(null);
  };

  const getTotalContributions = () => {
    return attendees.reduce((total, attendee) => total + (attendee.contribution || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Add Attendee Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Attendees ({attendees.length})
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Attendee
          </button>
        </div>

        {showAddForm && (
          <div className="border-t pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter attendee name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contribution Amount (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAttendee.contribution}
                    onChange={(e) => setNewAttendee(prev => ({ ...prev, contribution: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add Attendee
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-500" />
          Contributions Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {attendees.length}
            </div>
            <div className="text-sm text-blue-600">Total Attendees</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              Rs {getTotalContributions().toFixed(2)}
            </div>
            <div className="text-sm text-green-600">Total Contributions</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              Rs {attendees.length > 0 ? (getTotalContributions() / attendees.length).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-purple-600">Average Contribution</div>
          </div>
        </div>
      </div>

      {/* Attendees List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Attendee List</h3>
        </div>
        
        {attendees.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No attendees added yet</p>
            <p className="text-gray-500">Add attendees to start splitting expenses!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {attendees.map((attendee, index) => (
              <div key={attendee.id} className="p-6">
                {editingAttendee && editingAttendee.id === attendee.id ? (
                  // Edit Form
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={editingAttendee.name}
                          onChange={(e) => setEditingAttendee(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contribution
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingAttendee.contribution}
                          onChange={(e) => setEditingAttendee(prev => ({ ...prev, contribution: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-semibold">
                          {attendee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">{attendee.name}</h4>
                        <p className="text-gray-500 text-sm">Attendee #{index + 1}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-800">
                          Rs {(attendee.contribution || 0).toFixed(2)}
                        </div>
                        <div className="text-gray-500 text-sm">Contribution</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(attendee)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Attendee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(attendee.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Attendee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeManager;