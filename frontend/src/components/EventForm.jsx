import React, { useState } from 'react';
import { PlusCircle, Calendar, Sparkles, Users } from 'lucide-react';

const EventForm = ({ onCreateEvent }) => {
  const [formData, setFormData] = useState({
    partyName: '',
    partyDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partyName.trim() || !formData.partyDate) return;

    setIsSubmitting(true);
    try {
      await onCreateEvent({
        party_name: formData.partyName.trim(),
        party_date: formData.partyDate
      });
      setFormData({ partyName: '', partyDate: '' });
      
      // Success animation trigger
      const button = e.target.querySelector('button[type="submit"]');
      button?.classList.add('animate-bounce');
      setTimeout(() => button?.classList.remove('animate-bounce'), 1000);
      
    } catch (error) {
      console.error('Error creating event:', error);
    }
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.partyName.trim() && formData.partyDate;

  return (
    <div className="relative">
      {/* Animated background elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full animate-pulse delay-1000"></div>
      
      <div className="relative">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Event</h2>
            <p className="text-gray-600">Start splitting expenses with your friends</p>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" style={{animationDuration: '3s'}} />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Party Name Field */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-hover:text-blue-600">
                <Users className="w-4 h-4 inline mr-2" />
                Party Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.partyName}
                  onChange={(e) => handleChange('partyName', e.target.value)}
                  onFocus={() => setFocusedField('partyName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Birthday Party, Weekend Trip..."
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 placeholder-gray-400 ${
                    focusedField === 'partyName' 
                      ? 'border-blue-500 ring-4 ring-blue-500/20 transform scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  required
                />
                {focusedField === 'partyName' && (
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
                  value={formData.partyDate}
                  onChange={(e) => handleChange('partyDate', e.target.value)}
                  onFocus={() => setFocusedField('partyDate')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                    focusedField === 'partyDate' 
                      ? 'border-purple-500 ring-4 ring-purple-500/20 transform scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  required
                />
                {focusedField === 'partyDate' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`px-8 py-4 rounded-2xl font-semibold flex items-center space-x-3 transition-all duration-300 transform ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating Event...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Create Event</span>
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Form validation indicator */}
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              formData.partyName.trim() ? 'bg-green-500 scale-125' : 'bg-gray-300'
            }`}></div>
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              formData.partyDate ? 'bg-green-500 scale-125' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;