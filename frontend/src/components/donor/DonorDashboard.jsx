  // import { useState, useEffect } from "react";
  // import axios from "axios";
  // import { toast } from "react-toastify";

  // const DonorDashboard = () => {
  //   const [myDonations, setMyDonations] = useState([]);
  //   const [imageFiles, setImageFiles] = useState([]);
  //   const [loading, setLoading] = useState(false);
  //   const [formData, setFormData] = useState({
  //     name: "",
  //     description: "",
  //     category: "Clothing",
  //     condition: "Used - Good",
  //     location: "",
  //   });

  //   const { name, description, category, condition, location } = formData;

  //   // 👇 NEW: State for Time Slots
  //   const [slotInput, setSlotInput] = useState("");
  //   const [availableSlots, setAvailableSlots] = useState([]);

  //   useEffect(() => {
  //     fetchMyDonations();
  //     const interval = setInterval(fetchMyDonations, 5000); // Polling
  //     return () => clearInterval(interval);
  //   }, []);

  //   const fetchMyDonations = async () => {
  //     try {
  //       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //       const { data } = await axios.get(
  //         `http://localhost:5000/api/donations/my?t=${Date.now()}`,
  //         {
  //           headers: { Authorization: `Bearer ${userInfo.token}` },
  //         },
  //       );
  //       setMyDonations(data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   const onChange = (e) =>
  //     setFormData({ ...formData, [e.target.name]: e.target.value });
  //   const onFileChange = (e) => setImageFiles(e.target.files);

  //   // 👇 NEW: Handlers for adding and removing time slots
  //   const addSlot = (e) => {
  //     e.preventDefault();
  //     if (slotInput.trim()) {
  //       setAvailableSlots([...availableSlots, slotInput]);
  //       setSlotInput(""); // clear input
  //     }
  //   };

  //   const removeSlot = (indexToRemove) => {
  //     setAvailableSlots(availableSlots.filter((_, idx) => idx !== indexToRemove));
  //   };

  //   const onSubmit = async (e) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     if (!name || !description || !location) {
  //       setLoading(false);
  //       return toast.error("Please fill all fields");
  //     }

  //     const formDataToSend = new FormData();
  //     Object.keys(formData).forEach((key) =>
  //       formDataToSend.append(key, formData[key]),
  //     );
  //     for (let i = 0; i < imageFiles.length; i++) {
  //       formDataToSend.append("images", imageFiles[i]);
  //     }

  //     // 👇 NEW: Append the available slots as a JSON string
  //     formDataToSend.append("availableSlots", JSON.stringify(availableSlots));

  //     try {
  //       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //       await axios.post("http://localhost:5000/api/donations", formDataToSend, {
  //         headers: {
  //           Authorization: `Bearer ${userInfo.token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });

  //       toast.success("Donation Added!");

  //       // Reset the form
  //       setFormData({
  //         name: "",
  //         description: "",
  //         category: "Clothing",
  //         condition: "Used - Good",
  //         location: "",
  //       });
  //       setImageFiles([]);
  //       setAvailableSlots([]); // 👈 Clear slots after success!
  //       setSlotInput("");
  //       document.getElementById("fileInput").value = "";

  //       fetchMyDonations();
  //     } catch (error) {
  //       toast.error("Failed to add donation");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   return (
  //     <div className="max-w-6xl mx-auto p-4 md:p-8">
  //       {/* Form Section */}
  //       <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
  //         <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
  //           ➕ Add New Donation
  //         </h2>

  //         <form onSubmit={onSubmit}>
  //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //             {/* Left Column */}
  //             <div className="space-y-4">
  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Item Name
  //                 </label>
  //                 <input
  //                   type="text"
  //                   name="name"
  //                   value={name}
  //                   onChange={onChange}
  //                   className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
  //                   placeholder="e.g. Winter Jacket"
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Category
  //                 </label>
  //                 <select
  //                   name="category"
  //                   value={category}
  //                   onChange={onChange}
  //                   className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white"
  //                 >
  //                   {[
  //                     "Clothing",
  //                     "Food",
  //                     "Electronics",
  //                     "Furniture",
  //                     "Books",
  //                     "Toys",
  //                     "Other",
  //                   ].map((c) => (
  //                     <option key={c} value={c}>
  //                       {c}
  //                     </option>
  //                   ))}
  //                 </select>
  //               </div>
  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Condition
  //                 </label>
  //                 <select
  //                   name="condition"
  //                   value={condition}
  //                   onChange={onChange}
  //                   className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white"
  //                 >
  //                   {["New", "Used - Like New", "Used - Good", "Used - Fair"].map(
  //                     (c) => (
  //                       <option key={c} value={c}>
  //                         {c}
  //                       </option>
  //                     ),
  //                   )}
  //                 </select>
  //               </div>

  //               {/* 👇 NEW: Time Slots Field Added Here 👇 */}
  //               <div className="pt-2">
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Available Pickup Times
  //                 </label>
  //                 <div className="flex gap-2 mb-2">
  //                   <input
  //                     type="text"
  //                     value={slotInput}
  //                     onChange={(e) => setSlotInput(e.target.value)}
  //                     placeholder="e.g. 15th Feb, 2 PM - 5 PM"
  //                     className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
  //                   />
  //                   <button
  //                     type="button" // 👈 Prevents the form from submitting when adding a slot
  //                     onClick={addSlot}
  //                     className="bg-gray-800 text-white px-4 rounded font-bold hover:bg-gray-700 transition"
  //                   >
  //                     Add
  //                   </button>
  //                 </div>

  //                 {/* Show added slots as little tags */}
  //                 <div className="flex flex-wrap gap-2 mt-2">
  //                   {availableSlots.map((slot, idx) => (
  //                     <span
  //                       key={idx}
  //                       className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2"
  //                     >
  //                       {slot}
  //                       <button
  //                         type="button"
  //                         onClick={() => removeSlot(idx)}
  //                         className="text-green-500 hover:text-green-800"
  //                       >
  //                         ✖
  //                       </button>
  //                     </span>
  //                   ))}
  //                 </div>
  //               </div>
  //               {/* 👆 END Time Slots Field 👆 */}
  //             </div>

  //             {/* Right Column */}
  //             <div className="space-y-4">
  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Pickup Location
  //                 </label>
  //                 <input
  //                   type="text"
  //                   name="location"
  //                   value={location}
  //                   onChange={onChange}
  //                   className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
  //                   placeholder="Full Address"
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Images (Max 5)
  //                 </label>
  //                 <input
  //                   type="file"
  //                   id="fileInput"
  //                   multiple
  //                   onChange={onFileChange}
  //                   className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-sm font-medium text-gray-700 mb-1">
  //                   Description
  //                 </label>
  //                 <textarea
  //                   name="description"
  //                   value={description}
  //                   onChange={onChange}
  //                   className="w-full p-2 border border-gray-300 rounded h-32 focus:ring-2 focus:ring-green-500 outline-none resize-none"
  //                   placeholder="Details about the item..."
  //                 />
  //               </div>
  //             </div>
  //           </div>

  //           <button
  //             type="submit"
  //             disabled={loading}
  //             className={`w-full mt-8 py-3 rounded-lg text-white font-bold text-lg transition-all duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"}`}
  //           >
  //             {loading ? "⏳ Adding Donation..." : "Submit Donation 🎁"}
  //           </button>
  //         </form>
  //       </div>

  //       {/* History Section */}
  //       <h3 className="text-2xl font-bold text-gray-800 mb-4">
  //         📜 My Donation History
  //       </h3>
  //       {myDonations.length === 0 ? (
  //         <p className="text-gray-500 italic">No donations yet.</p>
  //       ) : (
  //         <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
  //           <div className="overflow-x-auto">
  //             <table className="min-w-full">
  //               <thead className="bg-gray-50 border-b border-gray-200">
  //                 <tr>
  //                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
  //                     Item
  //                   </th>
  //                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
  //                     Status
  //                   </th>
  //                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
  //                     Date & Time
  //                   </th>
  //                 </tr>
  //               </thead>
  //               <tbody className="bg-white divide-y divide-gray-200">
  //                 {myDonations.map((d) => (
  //                   <tr key={d._id} className="hover:bg-gray-50 transition">
  //                     <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
  //                       <img
  //                         src={d.image}
  //                         alt={d.name}
  //                         className="h-10 w-10 rounded object-cover shadow-sm border border-gray-100"
  //                       />
  //                       <span className="font-bold text-gray-900">{d.name}</span>
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap">
  //                       <span
  //                         className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
  //                           d.status === "Pending"
  //                             ? "bg-yellow-100 text-yellow-800"
  //                             : d.status === "Accepted"
  //                               ? "bg-blue-100 text-blue-800"
  //                               : "bg-green-100 text-green-800"
  //                         }`}
  //                       >
  //                         {d.status}
  //                       </span>
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //                       <div>{new Date(d.createdAt).toLocaleDateString()}</div>
  //                       {/* 👇 Shows chosen time in history if accepted */}
  //                       {d.pickupTime && (
  //                         <div className="text-xs text-blue-500 font-bold mt-1">
  //                           Pickup: {d.pickupTime}
  //                         </div>
  //                       )}
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  // export default DonorDashboard;
