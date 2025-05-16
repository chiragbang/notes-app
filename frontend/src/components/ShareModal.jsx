import React, { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ShareModal = ({ noteId, onClose }) => {
  const { token } = useAuth();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post(
        `/notes/${noteId}/share`,
        { email, permission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Note shared successfully!');
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share note');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Share Note</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">User Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Permission</label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="read">Read</option>
              <option value="write">Write</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Share
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;