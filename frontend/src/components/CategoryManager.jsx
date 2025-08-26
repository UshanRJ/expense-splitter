import React, { useState } from 'react';
import { Plus, DollarSign, Users, Check, X, Edit, Trash2 } from 'lucide-react';

const CategoryManager = ({ 
  categories, 
  attendees, 
  participations, 
  onAddCategory, 
  onUpdateParticipation,
  onUpdateCategory,
  onDeleteCategory 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    subcategory: '',
    amount: ''
  });

  const predefinedCategories = [
    { name: 'Food', subcategories: ['Veg', 'Non Veg'] },
    { name: 'Liquor', subcategories: [] },
    { name: 'Cigarettes', subcategories: [] },
    { name: 'Entertainment', subcategories: [] },
    { name: 'Transport', subcategories: [] }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.amount) return;

    try {
      await onAddCategory({
        name: newCategory.name,
        subcategory: newCategory.subcategory,
        amount: parseFloat(newCategory.amount)
      });
      
      setNewCategory({ name: '', subcategory: '', amount: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory.name || !editingCategory.amount) return;

    try {
      await onUpdateCategory(editingCategory.id, {
        name: editingCategory.name,
        subcategory: editingCategory.subcategory,
        amount: parseFloat(editingCategory.amount)
      });
      
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also remove all participation data.')) {
      try {
        await onDeleteCategory(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const startEdit = (category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      subcategory: category.subcategory || '',
      amount: category.amount
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
  };

  const isParticipating = (attendeeId, categoryId) => {
    const participation = participations.find(p => 
      p.attendee_id === attendeeId && p.category_id === categoryId
    );
    return participation ? participation.participates === 1 : false;
  };

  const handleParticipationChange = (attendeeId, categoryId, participates) => {
    onUpdateParticipation(attendeeId, categoryId, participates);
  };

  const getParticipantCount = (categoryId) => {
    return participations.filter(p => 
      p.category_id === categoryId && p.participates === 1
    ).length;
  };

  const getAmountPerPerson = (category) => {
    const participantCount = getParticipantCount(category.id);
    return participantCount > 0 ? (category.amount / participantCount).toFixed(2) : '0.00';
  };

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Expense Categories
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>

        {showAddForm && (
          <div className="border-t pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <select
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value, subcategory: '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {predefinedCategories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="custom">Custom Category</option>
                  </select>
                  
                  {newCategory.name === 'custom' && (
                    <input
                      type="text"
                      placeholder="Enter custom category name"
                      value={newCategory.subcategory}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value, subcategory: '' }))}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory (Optional)
                  </label>
                  {newCategory.name && predefinedCategories.find(cat => cat.name === newCategory.name)?.subcategories.length > 0 ? (
                    <select
                      value={newCategory.subcategory}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, subcategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">None</option>
                      {predefinedCategories.find(cat => cat.name === newCategory.name)?.subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newCategory.subcategory}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="Enter subcategory"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCategory.amount}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add Category
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

      {/* Categories List with Participation */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No categories added yet</p>
            <p className="text-gray-500">Add your first expense category to get started!</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm p-6">
              {editingCategory && editingCategory.id === category.id ? (
                // Edit Form
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        value={editingCategory.subcategory || ''}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingCategory.amount}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
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
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category.name}
                        {category.subcategory && (
                          <span className="text-gray-600 font-normal"> ({category.subcategory})</span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Total: Rs {category.amount.toFixed(2)}</span>
                        <span>•</span>
                        <span>Per person: Rs {getAmountPerPerson(category)}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {getParticipantCount(category.id)} participants
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Who should pay for this category?
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {attendees.map((attendee) => (
                        <label
                          key={attendee.id}
                          className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isParticipating(attendee.id, category.id)}
                            onChange={(e) => handleParticipationChange(
                              attendee.id, 
                              category.id, 
                              e.target.checked
                            )}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{attendee.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryManager;