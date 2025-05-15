// "use client";
// import React, { useEffect, useState, useRef } from "react";
// import io from "socket.io-client";
// import ProtectedRoute from "@/components/ProtectedRoutes";
// import { useAuth } from "@/context/AuthContext";
// import api from "@/lib/api";

// const DashboardPage = () => {
//   const { token } = useAuth();
//   const [notes, setNotes] = useState([]);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [error, setError] = useState("");
//   const socketRef = useRef(null);

//   useEffect(() => {
//     if (!token) return;

//     // Initialize socket connection
//      console.log('Connecting to socket at:', process.env.NEXT_PUBLIC_SOCKET_URL); 
//     socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
//       auth: { token },
//       transports: ["websocket"], // force websocket for stable connection
//     });

//     // Fetch notes and join rooms
//     fetchNotes();

//     // Listen for real-time updates only once
//     socketRef.current.on("receiveUpdate", (updatedNote) => {
//       setNotes((prevNotes) =>
//         prevNotes.map((note) =>
//           note._id === updatedNote._id ? updatedNote : note
//         )
//       );
//     });

//     // Cleanup socket connection on component unmount
//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [token]);

//   // Fetch notes from backend API
//   const fetchNotes = async () => {
//     try {
//       const { data } = await api.get("/notes", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotes(data);

//       // Join each note room for real-time collaboration
//       data.forEach((note) => {
//         socketRef.current.emit("joinNote", note._id);
//       });
//     } catch (err) {
//       console.error("Failed to fetch notes:", err);
//       setError("Failed to load notes.");
//     }
//   };

//   // Handle form submit to add a new note
//   const handleAddNote = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!title.trim() || !content.trim()) {
//       setError("Title and content are required.");
//       return;
//     }

//     try {
//       const { data } = await api.post(
//         "/notes",
//         { title, content },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Add new note locally
//       setNotes((prevNotes) => [data, ...prevNotes]);

//       // Clear form fields
//       setTitle("");
//       setContent("");

//       // Join the new note room for live updates
//       socketRef.current.emit("joinNote", data._id);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to add note.");
//     }
//   };

//   return (
//     <ProtectedRoute>
//       <div className="p-8 max-w-3xl mx-auto">
//         <h1 className="text-4xl font-bold mb-6">Your Notes Dashboard</h1>

//         <form onSubmit={handleAddNote} className="mb-8 space-y-4">
//           {error && <p className="text-red-600">{error}</p>}
//           <input
//             type="text"
//             placeholder="Note Title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full p-3 border rounded-md"
//             required
//           />
//           <textarea
//             placeholder="Note Content"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             className="w-full p-3 border rounded-md"
//             rows={5}
//             required
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 text-white py-2 px-5 rounded-md hover:bg-blue-700 transition"
//           >
//             Add Note
//           </button>
//         </form>

//         <section>
//           {notes.length === 0 ? (
//             <p className="text-gray-600">No notes available.</p>
//           ) : (
//             notes.map((note) => (
//               <div
//                 key={note._id}
//                 className="mb-6 p-5 border rounded-md shadow-sm bg-white"
//               >
//                 <h2 className="text-2xl font-semibold">{note.title}</h2>
//                 <p className="mt-2 text-gray-800 whitespace-pre-wrap">{note.content}</p>
//                 <p className="mt-3 text-sm text-gray-500">
//                   Last updated:{" "}
//                   {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
//                 </p>
//               </div>
//             ))
//           )}
//         </section>
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default DashboardPage;


"use client";
import React, { useEffect, useState, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const POLLING_INTERVAL = 5000; // 5 seconds

const DashboardPage = () => {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const pollingRef = useRef(null); // to store interval id

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

    // Initial fetch
    fetchNotes();

    // Setup polling interval
    pollingRef.current = setInterval(() => {
      fetchNotes();
    }, POLLING_INTERVAL);

    // Cleanup polling on unmount or token change
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

      // Optimistically update UI immediately
      setNotes((prev) => [data, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add note");
    }
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
              <h3 className="text-xl font-semibold">{note.title}</h3>
              <p className="text-gray-700 mt-2">{note.content}</p>
              <p className="text-sm text-gray-400 mt-1">
                Last updated: {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
