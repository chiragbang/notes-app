// "use client";
// import React, { useEffect, useState, useRef } from "react";
// import ProtectedRoute from "@/components/ProtectedRoutes";
// import { useAuth } from "@/context/AuthContext";
// import api from "@/lib/api";

// const POLLING_INTERVAL = 5000;

// const DashboardPage = () => {
//   const { token } = useAuth();
//   const [notes, setNotes] = useState([]);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [error, setError] = useState("");
//   const [editingNoteId, setEditingNoteId] = useState(null);
//   const [editFields, setEditFields] = useState({ title: "", content: "" });
//   const pollingRef = useRef(null);

//   const fetchNotes = async () => {
//     if (!token) return;
//     try {
//       const { data } = await api.get("/notes", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotes(data);
//     } catch (err) {
//       console.error("Failed to fetch notes", err);
//     }
//   };

//   useEffect(() => {
//     if (!token) return;

//     fetchNotes();
//     pollingRef.current = setInterval(fetchNotes, POLLING_INTERVAL);

//     return () => {
//       if (pollingRef.current) clearInterval(pollingRef.current);
//     };
//   }, [token]);

//   const handleAddNote = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const { data } = await api.post(
//         "/notes",
//         { title, content },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNotes((prev) => [data, ...prev]);
//       setTitle("");
//       setContent("");
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to add note");
//     }
//   };

//   const handleDeleteNote = async (id) => {
//     const confirm = window.confirm("Are you sure you want to delete this note?");
//     if (!confirm) return;

//     try {
//       await api.delete(`/notes/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotes((prev) => prev.filter((note) => note._id !== id));
//     } catch (err) {
//       console.error("Failed to delete note", err);
//     }
//   };

//   const handleEditClick = (note) => {
//     setEditingNoteId(note._id);
//     setEditFields({ title: note.title, content: note.content });
//   };

//   const handleEditChange = (e) => {
//     setEditFields({ ...editFields, [e.target.name]: e.target.value });
//   };

// //   const handleSaveEdit = async (id) => {
// //   setError(""); // clear error before save
// //   try {
// //     const { data } = await api.put(
// //       `/notes/${id}`,
// //       { ...editFields },
// //       { headers: { Authorization: `Bearer ${token}` } }
// //     );
// //     console.log("API response on update:", data); // check what you get
// //     setNotes((prev) =>
// //       prev.map((note) => (note._id === id ? data : note))
// //     );
// //     setEditingNoteId(null);
// //   } catch (err) {
// //     console.error("Failed to update note", err);
// //     setError(err.response?.data?.error || "Failed to update note");
// //   }
// // };

// const handleSaveEdit = async (id) => {
//   setError("");
//   try {
//     const response = await api.put(
//       `/notes/${id}`,
//       { ...editFields },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     console.log('handleSaveEdit: Response=', response.status, response.data);
//     setNotes((prev) => prev.map((note) => (note._id === id ? response.data : note)));
//     setEditingNoteId(null);
//   } catch (err) {
//     console.error('handleSaveEdit: Error=', {
//       status: err.response?.status,
//       data: err.response?.data,
//       message: err.message,
//     });
//     const errorMessage =
//       err.response?.data?.error ||
//       err.response?.statusText ||
//       'Failed to update note';
//     setError(errorMessage);
//   }
// };
//   const handleCancelEdit = () => {
//     setEditingNoteId(null);
//     setEditFields({ title: "", content: "" });
//   };

//   return (
//     <ProtectedRoute>
//       <div className="p-8 max-w-2xl mx-auto">
//         <h2 className="text-3xl font-semibold mb-6">Your Notes</h2>

//         <form onSubmit={handleAddNote} className="mb-8 space-y-4">
//           {error && <p className="text-red-500">{error}</p>}
//           <input
//             type="text"
//             placeholder="Title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full p-3 border rounded"
//             required
//           />
//           <textarea
//             placeholder="Content"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             className="w-full p-3 border rounded"
//             rows={4}
//             required
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//           >
//             Add Note
//           </button>
//         </form>

//         <div className="space-y-4">
//           {notes.length === 0 && <p className="text-gray-600">No notes found.</p>}
//           {notes.map((note) => (
//             <div key={note._id} className="bg-white shadow p-4 rounded">
//               {editingNoteId === note._id ? (
//                 <>
//                   <input
//                     type="text"
//                     name="title"
//                     value={editFields.title}
//                     onChange={handleEditChange}
//                     className="w-full p-2 border mb-2 rounded"
//                   />
//                   <textarea
//                     name="content"
//                     value={editFields.content}
//                     onChange={handleEditChange}
//                     rows={3}
//                     className="w-full p-2 border mb-2 rounded"
//                   />
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleSaveEdit(note._id)}
//                       className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={handleCancelEdit}
//                       className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <h3 className="text-xl font-semibold">{note.title}</h3>
//                   <p className="text-gray-700 mt-2">{note.content}</p>
//                   <p className="text-sm text-gray-400 mt-1">
//                     Last updated: {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
//                   </p>
//                   <div className="flex gap-3 mt-3">
//                     <button
//                       onClick={() => handleEditClick(note)}
//                       className="text-blue-600 hover:underline"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteNote(note._id)}
//                       className="text-red-600 hover:underline"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default DashboardPage;



// "use client";
// import React, { useEffect, useState, useRef } from "react";
// import ProtectedRoute from "@/components/ProtectedRoutes";
// import ShareModal from "@/components/ShareModal";
// import { useAuth } from "@/context/AuthContext";
// import api from "@/lib/api";
// import io from 'socket.io-client';

// const POLLING_INTERVAL = 5000;

// const DashboardPage = () => {
//   const { token } = useAuth();
//   const [notes, setNotes] = useState([]);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [error, setError] = useState("");
//   const [editingNoteId, setEditingNoteId] = useState(null);
//   const [editFields, setEditFields] = useState({ title: "", content: "" });
//   const [showShareModal, setShowShareModal] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const pollingRef = useRef(null);
//   const socketRef = useRef(null);

//   const fetchNotes = async () => {
//     if (!token) return;
//     try {
//       const { data } = await api.get("/notes", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotes(data.notes);
//     } catch (err) {
//       console.error("Failed to fetch notes", err);
//     }
//   };

//   useEffect(() => {
//     if (!token) return;

//     fetchNotes();
//     pollingRef.current = setInterval(fetchNotes, POLLING_INTERVAL);

//     socketRef.current = io('http://localhost:5000');
//     socketRef.current.on('connect', () => {
//       console.log('Socket.IO: Connected to server');
//       notes.forEach((note) => socketRef.current.emit('joinNote', note._id));
//     });

//     socketRef.current.on('noteUpdated', ({ noteId, message, updatedNote }) => {
//       setNotifications((prev) => [...prev, { noteId, message }]);
//       setNotes((prev) =>
//         prev.map((note) => (note._id === noteId ? updatedNote : note))
//       );
//     });

//     return () => {
//       if (pollingRef.current) clearInterval(pollingRef.current);
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, [token, notes]);

//   const handleAddNote = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const { data } = await api.post(
//         "/notes",
//         { title, content },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNotes((prev) => [data, ...prev]);
//       setTitle("");
//       setContent("");
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to add note");
//     }
//   };

//   const handleDeleteNote = async (id) => {
//     const confirm = window.confirm("Are you sure you want to delete this note?");
//     if (!confirm) return;

//     try {
//       await api.delete(`/notes/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotes((prev) => prev.filter((note) => note._id !== id));
//     } catch (err) {
//       console.error("Failed to delete note", err);
//     }
//   };

//   const handleEditClick = (note) => {
//     setEditingNoteId(note._id);
//     setEditFields({ title: note.title, content: note.content });
//   };

//   const handleEditChange = (e) => {
//     setEditFields({ ...editFields, [e.target.name]: e.target.value });
//   };

//   const handleSaveEdit = async (id) => {
//     setError("");
//     try {
//       const response = await api.put(
//         `/notes/${id}`,
//         { ...editFields },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("API response on update:", response.data);
//       setNotes((prev) =>
//         prev.map((note) => (note._id === id ? response.data : note))
//       );
//       setEditingNoteId(null);
//     } catch (err) {
//       console.error("Failed to update note:", err.response?.status, err.response?.data);
//       setError(err.response?.data?.error || "Failed to update note");
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingNoteId(null);
//     setEditFields({ title: "", content: "" });
//   };

//   const handleShareClick = (noteId) => {
//     setShowShareModal(noteId);
//   };

//   return (
//     <ProtectedRoute>
//       <div className="p-8 max-w-2xl mx-auto">
//         <h2 className="text-3xl font-semibold mb-6">Your Notes</h2>

//         {/* Notifications */}
//         {notifications.map((notif, index) => (
//           <div key={index} className="bg-yellow-100 p-2 mb-4 rounded">
//             {notif.message}
//           </div>
//         ))}

//         <form onSubmit={handleAddNote} className="mb-8 space-y-4">
//           {error && <p className="text-red-500">{error}</p>}
//           <input
//             type="text"
//             placeholder="Title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full p-3 border rounded"
//             required
//           />
//           <textarea
//             placeholder="Content"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             className="w-full p-3 border rounded"
//             rows={4}
//             required
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//           >
//             Add Note
//           </button>
//         </form>

//         <div className="space-y-4">
//           {notes.length === 0 && <p className="text-gray-600">No notes found.</p>}
//           {notes.map((note) => (
//             <div key={note._id} className="bg-white shadow p-4 rounded">
//               {editingNoteId === note._id ? (
//                 <>
//                   <input
//                     type="text"
//                     name="title"
//                     value={editFields.title}
//                     onChange={handleEditChange}
//                     className="w-full p-2 border mb-2 rounded"
//                   />
//                   <textarea
//                     name="content"
//                     value={editFields.content}
//                     onChange={handleEditChange}
//                     rows={3}
//                     className="w-full p-2 border mb-2 rounded"
//                   />
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleSaveEdit(note._id)}
//                       className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={handleCancelEdit}
//                       className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <h3 className="text-xl font-semibold">{note.title}</h3>
//                   <p className="text-gray-700 mt-2">{note.content}</p>
//                   <p className="text-sm text-gray-400 mt-1">
//                     Last updated: {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
//                   </p>
//                   <p className="text-sm text-gray-400">
//                     Shared with: {note.collaborators.length > 0 ? note.collaborators.map(c => c.userId.email).join(', ') : 'None'}
//                   </p>
//                   <div className="flex gap-3 mt-3">
//                     {note.createdBy._id === useAuth().user?._id && (
//                       <button
//                         onClick={() => handleShareClick(note._id)}
//                         className="text-green-600 hover:underline"
//                       >
//                         Share
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleEditClick(note)}
//                       className="text-blue-600 hover:underline"
//                       disabled={note.collaborators.find(c => c.userId._id === useAuth().user?._id)?.permission !== 'write' && note.createdBy._id !== useAuth().user?._id}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteNote(note._id)}
//                       className="text-red-600 hover:underline"
//                       disabled={note.createdBy._id !== useAuth().user?._id}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>

//         {showShareModal && (
//           <ShareModal noteId={showShareModal} onClose={() => setShowShareModal(null)} />
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default DashboardPage;


// "use client";
// import React, { useEffect, useState, useRef } from "react";
// import ProtectedRoute from "@/components/ProtectedRoutes";
// import ShareModal from "@/components/ShareModal";
// import { useAuth } from "@/context/AuthContext";
// import api from "@/lib/api";
// import io from "socket.io-client";

// const DashboardPage = () => {
//   const { token, user } = useAuth();
//   const [notes, setNotes] = useState([]);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [error, setError] = useState("");
//   const [editingNoteId, setEditingNoteId] = useState(null);
//   const [editFields, setEditFields] = useState({ title: "", content: "" });
//   const [savePending, setSavePending] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [activeTab, setActiveTab] = useState("myNotes");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const saveTimeoutRef = useRef(null);
//   const socketRef = useRef(null);

//   const fetchNotes = async (currentPage = 1) => {
//     if (!token) return;
//     try {
//       const { data } = await api.get(`/notes?page=${currentPage}&limit=10`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotes(data.notes);
//       setTotalPages(data.pages);
//       setPage(data.page);
//     } catch (err) {
//       console.error("Failed to fetch notes:", err);
//       setError(err.response?.data?.error || "Failed to fetch notes");
//     }
//   };

//   useEffect(() => {
//     if (!token) return;

//     fetchNotes();

//     socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
//     socketRef.current.on("connect", () => {
//       console.log("Socket.IO: Connected to server");
//       notes.forEach((note) => socketRef.current.emit("joinNote", note._id));
//     });

//     socketRef.current.on("noteUpdated", ({ noteId, message, updatedNote }) => {
//       setNotifications((prev) => [...prev, { noteId, message }]);
//       setNotes((prev) =>
//         prev.map((note) => (note._id === noteId ? updatedNote : note))
//       );
//     });

//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//       clearTimeout(saveTimeoutRef.current);
//     };
//   }, [token]);

//   useEffect(() => {
//     if (savePending && editingNoteId) {
//       saveTimeoutRef.current = setTimeout(autosaveNote, 3000);
//     }
//     return () => clearTimeout(saveTimeoutRef.current);
//   }, [editFields, savePending, editingNoteId]);

//   const handleAddNote = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const { data } = await api.post(
//         "/notes",
//         { title, content },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNotes((prev) => [data, ...prev]);
//       setTitle("");
//       setContent("");
//       socketRef.current.emit("joinNote", data._id);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to add note");
//     }
//   };

//   const handleDeleteNote = async (id) => {
//     const confirm = window.confirm("Are you sure you want to delete this note?");
//     if (!confirm) return;

//     try {
//       await api.delete(`/notes/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotes((prev) => prev.filter((note) => note._id !== id));
//     } catch (err) {
//       console.error("Failed to delete note:", err);
//       setError(err.response?.data?.error || "Failed to delete note");
//     }
//   };

//   const handleEditClick = (note) => {
//     setEditingNoteId(note._id);
//     setEditFields({ title: note.title, content: note.content });
//     setSavePending(false);
//   };

//   const handleEditChange = (e) => {
//     setEditFields({ ...editFields, [e.target.name]: e.target.value });
//     setSavePending(true);
//   };

//   const autosaveNote = async () => {
//     if (!savePending || !editingNoteId) return;
//     try {
//       const response = await api.put(
//         `/notes/${editingNoteId}`,
//         { ...editFields },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Autosave response:", response.data);
//       setNotes((prev) =>
//         prev.map((note) => (note._id === editingNoteId ? response.data : note))
//       );
//       setSavePending(false);
//     } catch (err) {
//       console.error("Autosave failed:", err);
//       setError(err.response?.data?.error || "Failed to update note");
//     }
//   };

//   const handleSaveEdit = async (id) => {
//     setError("");
//     try {
//       const response = await api.put(
//         `/notes/${id}`,
//         { ...editFields },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("API response on update:", response.data);
//       setNotes((prev) =>
//         prev.map((note) => (note._id === id ? response.data : note))
//       );
//       setEditingNoteId(null);
//       setSavePending(false);
//     } catch (err) {
//       console.error("Failed to update note:", err.response?.status, err.response?.data);
//       setError(err.response?.data?.error || "Failed to update note");
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingNoteId(null);
//     setEditFields({ title: "", content: "" });
//     setSavePending(false);
//   };

//   const handleShareClick = (noteId) => {
//     setShowShareModal(noteId);
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPage(newPage);
//       fetchNotes(newPage);
//     }
//   };

//   const myNotes = notes.filter((note) => note.createdBy._id === user?._id);
//   const sharedNotes = notes.filter((note) =>
//     note.collaborators.some((c) => c.userId._id === user?._id)
//   );

//   return (
//     <ProtectedRoute>
//       <div className="p-8 max-w-4xl mx-auto">
//         <h2 className="text-3xl font-semibold mb-6">Your Notes</h2>

//         {/* Tabs */}
//         <div className="flex gap-4 mb-6">
//           <button
//             onClick={() => setActiveTab("myNotes")}
//             className={`px-4 py-2 rounded ${
//               activeTab === "myNotes" ? "bg-blue-600 text-white" : "bg-gray-200"
//             }`}
//           >
//             My Notes
//           </button>
//           <button
//             onClick={() => setActiveTab("shared")}
//             className={`px-4 py-2 rounded ${
//               activeTab === "shared" ? "bg-blue-600 text-white" : "bg-gray-200"
//             }`}
//           >
//             Shared with Me
//           </button>
//         </div>

//         {/* Notifications */}
//         {notifications.map((notif, index) => (
//           <div
//             key={index}
//             className="bg-yellow-100 p-2 mb-4 rounded flex justify-between items-center"
//           >
//             <span>{notif.message}</span>
//             <button
//               onClick={() =>
//                 setNotifications((prev) => prev.filter((_, i) => i !== index))
//               }
//               className="text-gray-600 hover:text-gray-800"
//             >
//               ✕
//             </button>
//           </div>
//         ))}

//         {/* Add Note Form */}
//         {activeTab === "myNotes" && (
//           <form onSubmit={handleAddNote} className="mb-8 space-y-4">
//             {error && <p className="text-red-500">{error}</p>}
//             <input
//               type="text"
//               placeholder="Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full p-3 border rounded"
//               required
//             />
//             <textarea
//               placeholder="Content"
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               className="w-full p-3 border rounded"
//               rows={4}
//               required
//             />
//             <button
//               type="submit"
//               className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//             >
//               Add Note
//             </button>
//           </form>
//         )}

//         {/* Notes List */}
//         <div className="space-y-4">
//           {(activeTab === "myNotes" ? myNotes : sharedNotes).length === 0 && (
//             <p className="text-gray-600">No notes found.</p>
//           )}
//           {(activeTab === "myNotes" ? myNotes : sharedNotes).map((note) => (
//             <div key={note._id} className="bg-white shadow p-4 rounded">
//               {editingNoteId === note._id ? (
//                 <>
//                   <input
//                     type="text"
//                     name="title"
//                     value={editFields.title}
//                     onChange={handleEditChange}
//                     onBlur={autosaveNote}
//                     className="w-full p-2 border mb-2 rounded"
//                   />
//                   <textarea
//                     name="content"
//                     value={editFields.content}
//                     onChange={handleEditChange}
//                     onBlur={autosaveNote}
//                     rows={3}
//                     className="w-full p-2 border mb-2 rounded"
//                   />
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleSaveEdit(note._id)}
//                       className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={handleCancelEdit}
//                       className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
//                     >
//                       Cancel
//                     </button>
//                     {savePending && (
//                       <span className="text-gray-500 text-sm">Saving...</span>
//                     )}
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <h3 className="text-xl font-semibold">{note.title}</h3>
//                   <p className="text-gray-700 mt-2">{note.content}</p>
//                   <p className="text-sm text-gray-400 mt-1">
//                     Last updated:{" "}
//                     {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
//                   </p>
//                   <p className="text-sm text-gray-400">
//                     Shared with:{" "}
//                     {note.collaborators.length > 0
//                       ? note.collaborators
//                           .map((c) => c.userId.email || "Unknown")
//                           .join(", ")
//                       : "None"}
//                   </p>
//                   <div className="flex gap-3 mt-3">
//                     {note.createdBy._id === user?._id && (
//                       <button
//                         onClick={() => handleShareClick(note._id)}
//                         className="text-green-600 hover:underline"
//                       >
//                         Share
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleEditClick(note)}
//                       className="text-blue-600 hover:underline"
//                       disabled={
//                         note.collaborators.find((c) => c.userId._id === user?._id)
//                           ?.permission !== "write" && note.createdBy._id !== user?._id
//                       }
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteNote(note._id)}
//                       className="text-red-600 hover:underline"
//                       disabled={note.createdBy._id !== user?._id}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex gap-2 mt-6 justify-center">
//             <button
//               onClick={() => handlePageChange(page - 1)}
//               disabled={page === 1}
//               className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => handlePageChange(page + 1)}
//               disabled={page === totalPages}
//               className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         )}

//         {showShareModal && (
//           <ShareModal
//             noteId={showShareModal}
//             onClose={() => setShowShareModal(null)}
//           />
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default DashboardPage;


"use client";
import React, { useEffect, useState, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoutes";
import ShareModal from "@/components/ShareModal";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import io from "socket.io-client";

const DashboardPage = () => {
  const { token, user } = useAuth();
  const [notes, setNotes] = useState([]); // Ensure initial state is an array
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editFields, setEditFields] = useState({ title: "", content: "" });
  const [savePending, setSavePending] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("myNotes");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // Add loading state
  const saveTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const fetchNotes = async (currentPage = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/notes?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(Array.isArray(data.notes) ? data.notes : []); // Ensure notes is an array
      setTotalPages(data.pages || 1);
      setPage(data.page || 1);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setError(err.response?.data?.error || "Failed to fetch notes");
      setNotes([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user) return;

    fetchNotes();

    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
    socketRef.current.on("connect", () => {
      console.log("Socket.IO: Connected to server");
      notes.forEach((note) => socketRef.current.emit("joinNote", note._id));
    });

    socketRef.current.on("noteUpdated", ({ noteId, message, updatedNote }) => {
      if (!updatedNote || !noteId) return; // Guard against malformed data
      setNotifications((prev) => [...prev, { noteId, message }]);
      setNotes((prev) =>
        Array.isArray(prev)
          ? prev.map((note) => (note._id === noteId ? updatedNote : note))
          : [updatedNote]
      );
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearTimeout(saveTimeoutRef.current);
    };
  }, [token, user]);

  useEffect(() => {
    if (savePending && editingNoteId) {
      saveTimeoutRef.current = setTimeout(autosaveNote, 3000);
    }
    return () => clearTimeout(saveTimeoutRef.current);
  }, [editFields, savePending, editingNoteId]);

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
      socketRef.current.emit("joinNote", data._id);
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
      console.error("Failed to delete note:", err);
      setError(err.response?.data?.error || "Failed to delete note");
    }
  };

  const handleEditClick = (note) => {
    setEditingNoteId(note._id);
    setEditFields({ title: note.title, content: note.content });
    setSavePending(false);
  };

  const handleEditChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
    setSavePending(true);
  };

  const autosaveNote = async () => {
    if (!savePending || !editingNoteId) return;
    try {
      const response = await api.put(
        `/notes/${editingNoteId}`,
        { ...editFields },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Autosave response:", response.data);
      setNotes((prev) =>
        prev.map((note) => (note._id === editingNoteId ? response.data : note))
      );
      setSavePending(false);
    } catch (err) {
      console.error("Autosave failed:", err);
      setError(err.response?.data?.error || "Failed to update note");
    }
  };

  const handleSaveEdit = async (id) => {
    setError("");
    try {
      const response = await api.put(
        `/notes/${id}`,
        { ...editFields },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("API response on update:", response.data);
      setNotes((prev) =>
        prev.map((note) => (note._id === id ? response.data : note))
      );
      setEditingNoteId(null);
      setSavePending(false);
    } catch (err) {
      console.error("Failed to update note:", err.response?.status, err.response?.data);
      setError(err.response?.data?.error || "Failed to update note");
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditFields({ title: "", content: "" });
    setSavePending(false);
  };

  const handleShareClick = (noteId) => {
    setShowShareModal(noteId);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchNotes(newPage);
    }
  };

  // Guard against undefined notes or user
  const myNotes = Array.isArray(notes) && user
    ? notes.filter((note) => note.createdBy?._id === user._id)
    : [];
  const sharedNotes = Array.isArray(notes) && user
    ? notes.filter((note) =>
        note.collaborators.some((c) => c.userId?._id === user._id)
      )
    : [];

  if (!user || loading) {
    return (
      <ProtectedRoute>
        <div className="p-8 max-w-4xl mx-auto">
          <p className="text-gray-600">Loading...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">Your Notes</h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("myNotes")}
            className={`px-4 py-2 rounded ${
              activeTab === "myNotes" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            My Notes
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={`px-4 py-2 rounded ${
              activeTab === "shared" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Shared with Me
          </button>
        </div>

        {/* Notifications */}
        {notifications.map((notif, index) => (
          <div
            key={index}
            className="bg-yellow-100 p-2 mb-4 rounded flex justify-between items-center"
          >
            <span>{notif.message}</span>
            <button
              onClick={() =>
                setNotifications((prev) => prev.filter((_, i) => i !== index))
              }
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add Note Form */}
        {activeTab === "myNotes" && (
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
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {(activeTab === "myNotes" ? myNotes : sharedNotes).length === 0 && (
            <p className="text-gray-600">No notes found.</p>
          )}
          {(activeTab === "myNotes" ? myNotes : sharedNotes).map((note) => (
            <div key={note._id} className="bg-white shadow p-4 rounded">
              {editingNoteId === note._id ? (
                <>
                  <input
                    type="text"
                    name="title"
                    value={editFields.title || ""}
                    onChange={handleEditChange}
                    onBlur={autosaveNote}
                    className="w-full p-2 border mb-2 rounded"
                  />
                  <textarea
                    name="content"
                    value={editFields.content || ""}
                    onChange={handleEditChange}
                    onBlur={autosaveNote}
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
                    {savePending && (
                      <span className="text-gray-500 text-sm">Saving...</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{note.title || "Untitled"}</h3>
                  <p className="text-gray-700 mt-2">{note.content || "No content"}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Last updated:{" "}
                    {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Shared with:{" "}
                    {note.collaborators.length > 0
                      ? note.collaborators
                          .map((c) => c.userId?.email || "Unknown")
                          .join(", ")
                      : "None"}
                  </p>
                  <div className="flex gap-3 mt-3">
                    {note.createdBy?._id === user._id && (
                      <button
                        onClick={() => handleShareClick(note._id)}
                        className="text-green-600 hover:underline"
                      >
                        Share
                      </button>
                    )}
                    <button
                      onClick={() => handleEditClick(note)}
                      className="text-blue-600 hover:underline"
                      disabled={
                        note.collaborators.find((c) => c.userId?._id === user._id)
                          ?.permission !== "write" && note.createdBy?._id !== user._id
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 hover:underline"
                      disabled={note.createdBy?._id !== user._id}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 mt-6 justify-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {showShareModal && (
          <ShareModal
            noteId={showShareModal}
            onClose={() => setShowShareModal(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;