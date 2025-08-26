import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Sparkles } from 'lucide-react';

const EditEventModal = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    party_name: event.party_name || '',
    party_date: event.party_date || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.party_name.trim() || !formData.party_date) return;

    setIsSaving(true);
    try {
      await onSave(event.id, formData);
    } catch (error) {
      console.error('Error updating event:', error);
    }
    setIsSaving(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 300); // Wait for animation to complete
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.party_name.trim() && formData.party_date;
  const hasChanges = formData.party_name !== event.party_name || formData.party_date !== event.party_date;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div 
        className={`bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-t-3xl border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Edit Event</h2>
                <p className="text-gray-600 text-sm">Update your party details</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-2 right-20 w-4 h-4 bg-yellow-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 left-20 w-3 h-3 bg-pink-400/30 rounded-full animate-pulse delay-1000"></div>
          <Sparkles className="absolute top-4 right-32 w-4 h-4 text-purple-400 animate-spin" style={{animationDuration: '4s'}} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Party Name Field */}
          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-hover:text-blue-600">
              <Users className="w-4 h-4 inline mr-2" />
              Party Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.party_name}
                onChange={(e) => handleChange('party_name', e.target.value)}
                onFocus={() => setFocusedField('party_name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter party name"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 placeholder-gray-400 ${
                  focusedField === 'party_name' 
                    ? 'border-blue-500 ring-4 ring-blue-500/20 transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                required
              />
              {focusedField === 'party_name' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              )}
            </div>
          </div>

          {/* Party Date Field */}
          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-hover:text-purple-600">
              <Calendar className="w-4 h-4 inline mr-2" />
              Party Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.party_date}
                onChange={(e) => handleChange('party_date', e.target.value)}
                onFocus={() => setFocusedField('party_date')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                  focusedField === 'party_date' 
                    ? 'border-purple-500 ring-4 ring-purple-500/20 transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                required
              />
              {focusedField === 'party_date' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
              )}
            </div>
          </div>

          {/* Changes indicator */}
          {hasChanges && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-3 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>You have unsaved changes</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSaving || !isFormValid || !hasChanges}
              className={`flex-1 px-6 py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform ${
                isFormValid && hasChanges && !isSaving
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Form validation indicators */}
        <div className="px-6 pb-6">
          <div className="flex justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              formData.party_name.trim() ? 'bg-green-500 scale-125' : 'bg-gray-300'
            }`}></div>
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              formData.party_date ? 'bg-green-500 scale-125' : 'bg-gray-300'
            }`}></div>
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              hasChanges ? 'bg-blue-500 scale-125' : 'bg-gray-300'
            }`}></div>
          </div>
          <div className="text-center mt-2 text-xs text-gray-500">
            Name • Date • Changes
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;