"use client";
import React, { useEffect, useState, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const POLLING_INTERVAL = 5000;

const DashboardPage = () => {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editFields, setEditFields] = useState({ title: "", content: "" });
  const pollingRef = useRef(null);

  const fetchNotes = async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchNotes();
    pollingRef.current = setInterval(fetchNotes, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post(
        "/notes",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes((prev) => [data, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add note");
    }
  };

  const handleDeleteNote = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this note?");
    if (!confirm) return;

    try {
      await api.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  const handleEditClick = (note) => {
    setEditingNoteId(note._id);
    setEditFields({ title: note.title, content: note.content });
  };

  const handleEditChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

//   const handleSaveEdit = async (id) => {
//   setError(""); // clear error before save
//   try {
//     const { data } = await api.put(
//       `/notes/${id}`,
//       { ...editFields },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     console.log("API response on update:", data); // check what you get
//     setNotes((prev) =>
//       prev.map((note) => (note._id === id ? data : note))
//     );
//     setEditingNoteId(null);
//   } catch (err) {
//     console.error("Failed to update note", err);
//     setError(err.response?.data?.error || "Failed to update note");
//   }
// };

const handleSaveEdit = async (id) => {
  setError("");
  try {
    const response = await api.put(
      `/notes/${id}`,
      { ...editFields },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('handleSaveEdit: Response=', response.status, response.data);
    setNotes((prev) => prev.map((note) => (note._id === id ? response.data : note)));
    setEditingNoteId(null);
  } catch (err) {
    console.error('handleSaveEdit: Error=', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    const errorMessage =
      err.response?.data?.error ||
      err.response?.statusText ||
      'Failed to update note';
    setError(errorMessage);
  }
};
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditFields({ title: "", content: "" });
  };

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">Your Notes</h2>

        <form onSubmit={handleAddNote} className="mb-8 space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded"
            rows={4}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Add Note
          </button>
        </form>

        <div className="space-y-4">
          {notes.length === 0 && <p className="text-gray-600">No notes found.</p>}
          {notes.map((note) => (
            <div key={note._id} className="bg-white shadow p-4 rounded">
              {editingNoteId === note._id ? (
                <>
                  <input
                    type="text"
                    name="title"
                    value={editFields.title}
                    onChange={handleEditChange}
                    className="w-full p-2 border mb-2 rounded"
                  />
                  <textarea
                    name="content"
                    value={editFields.content}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full p-2 border mb-2 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <p className="text-gray-700 mt-2">{note.content}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Last updated: {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleEditClick(note)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
