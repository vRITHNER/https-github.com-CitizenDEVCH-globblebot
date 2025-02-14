import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { supabase } from '../lib/supabase';
import type { ConversationTopic } from '../lib/types';
import toast from 'react-hot-toast';

const TopicsAdmin: React.FC = () => {
  const { profile } = useProfile();
  const location = useLocation();
  const [topics, setTopics] = useState<ConversationTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTopic, setEditingTopic] = useState<ConversationTopic | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (err) {
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const topicData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      difficulty: formData.get('difficulty') as string,
    };

    try {
      if (editingTopic) {
        const { error } = await supabase
          .from('topics')
          .update(topicData)
          .eq('id', editingTopic.id);

        if (error) throw error;
        toast.success('Topic updated successfully');
      } else {
        const { error } = await supabase
          .from('topics')
          .insert([{ ...topicData, created_by: profile?.id }]);

        if (error) throw error;
        toast.success('Topic created successfully');
      }

      setShowForm(false);
      setEditingTopic(null);
      fetchTopics();
    } catch (err) {
      toast.error('Failed to save topic');
    }
  };

  const handleDelete = async (topic: ConversationTopic) => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topic.id);

      if (error) {
        if (error.message.includes('can_delete_topic')) {
          throw new Error('Cannot delete topic that is being used in conversations');
        }
        throw error;
      }

      toast.success('Topic deleted successfully');
      fetchTopics();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete topic';
      toast.error(message);
    }
  };

  if (!profile?.is_admin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Topics</h1>
        <button
          onClick={() => {
            setEditingTopic(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={editingTopic?.title}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                defaultValue={editingTopic?.description}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingTopic?.category}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  name="difficulty"
                  defaultValue={editingTopic?.difficulty}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTopic(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingTopic ? 'Update' : 'Create'} Topic
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No topics</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new topic.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{topic.title}</div>
                    <div className="text-sm text-gray-500">{topic.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {topic.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {topic.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      topic.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {topic.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingTopic(topic);
                        setShowForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(topic)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopicsAdmin;