import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DonationMap from "../DonationMap";

// Helper function to calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const AdminDashboard = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const role = userInfo?.role;

  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [userLocation, setUserLocation] = useState(null);

  const [activeTab, setActiveTab] = useState(
    role === "admin" ? "users" : "donations",
  );

  // 👇 NEW: States for the Image Pop-up Modal 👇
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get the NGO's current location when the page loads
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          if (role !== "admin") {
            toast.info("Enable browser location to see exact distances!");
          }
        },
      );
    }
  }, [role]);

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
    }
    fetchDonations();
  }, [role]);

  const getAuthHeader = () => {
    return { headers: { Authorization: `Bearer ${userInfo.token}` } };
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/admin/users?t=${Date.now()}`,
        getAuthHeader(),
      );
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDonations = async () => {
    try {
      const url =
        role === "admin"
          ? `http://localhost:5000/api/admin/donations?t=${Date.now()}`
          : `http://localhost:5000/api/donations?t=${Date.now()}`;

      const { data } = await axios.get(url, getAuthHeader());
      setDonations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const verifyUser = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/verify`,
        {},
        getAuthHeader(),
      );
      toast.success("NGO Verified Successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to verify NGO");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/users/${id}`,
          getAuthHeader(),
        );
        toast.success("User Deleted");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const deleteDonation = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/donations/${id}`,
          getAuthHeader(),
        );
        toast.success("Donation Deleted");
        fetchDonations();
      } catch (error) {
        toast.error("Failed to delete donation");
      }
    }
  };

  const updateDonationStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      const donationToUpdate = donations.find((d) => d._id === id);

      if (newStatus === "Accepted") {
        const hasSlots = donationToUpdate?.availableSlots?.length > 0;
        if (hasSlots) {
          const chosenSlot = selectedSlots[id];
          if (!chosenSlot) {
            return toast.error(
              "⚠️ Please select a pickup time from the dropdown before accepting!",
            );
          }
          payload.pickupTime = chosenSlot;
        } else {
          payload.pickupTime = "To be coordinated with donor";
        }
      }

      await axios.put(
        `http://localhost:5000/api/donations/${id}`,
        payload,
        getAuthHeader(),
      );
      toast.success(
        `Pickup confirmed ${payload.pickupTime ? `for: ${payload.pickupTime}` : ""}!`,
      );
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // 👇 NEW: Modal Logic Functions 👇
  const openImageModal = (images, fallbackImage) => {
    let imgsToView = [];
    if (images && images.length > 0) {
      imgsToView = images; // Use the array of images
    } else if (fallbackImage && !fallbackImage.includes("placeholder")) {
      imgsToView = [fallbackImage]; // Use single image if array is missing
    }

    if (imgsToView.length > 0) {
      setCurrentImages(imgsToView);
      setCurrentImageIndex(0);
      setIsImageModalOpen(true);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = (e) => {
    e.stopPropagation(); // Prevents the modal background click from triggering
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + currentImages.length) % currentImages.length,
    );
  };
  // 👆 END Modal Logic 👆

  const ngoUsers = users.filter((u) => u.role === "ngo");
  const donorUsers = users.filter((u) => u.role === "donor");

  const activeDonations = donations
    .filter((d) => d.status !== "Collected")
    .map((d) => {
      let dist = null;
      if (userLocation && d.geometry?.coordinates?.length === 2) {
        const [dLng, dLat] = d.geometry.coordinates;
        dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          dLat,
          dLng,
        );
      }
      return { ...d, distance: dist };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  const collectedDonations = donations
    .filter((d) => d.status === "Collected")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
      {/* 👇 IMAGE POPUP MODAL (LIGHTBOX) 👇 */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 transition-opacity"
          onClick={closeImageModal}
        >
          <div
            className="relative w-full max-w-4xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute -top-10 right-0 text-white text-4xl font-bold hover:text-red-500 transition z-50"
              onClick={closeImageModal}
            >
              &times;
            </button>

            {/* Main Displayed Image */}
            <img
              src={currentImages[currentImageIndex]}
              alt="Donation Full View"
              className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl transition-transform"
            />

            {/* Render Navigation Arrows if more than 1 image */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-80 text-white p-3 rounded-full text-2xl transition shadow-lg backdrop-blur-sm"
                >
                  &#10094;
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-80 text-white p-3 rounded-full text-2xl transition shadow-lg backdrop-blur-sm"
                >
                  &#10095;
                </button>

                {/* Image Counter */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-60 px-4 py-1 rounded-full text-sm font-bold tracking-widest shadow">
                  {currentImageIndex + 1} / {currentImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* 👆 END IMAGE MODAL 👆 */}

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-8">
        {role === "admin" && (
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium text-lg focus:outline-none transition-colors ${
              activeTab === "users"
                ? "border-b-4 border-red-500 text-red-500"
                : "text-gray-500 hover:text-red-400"
            }`}
          >
            👥 Manage Users
          </button>
        )}
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-6 py-3 font-medium text-lg focus:outline-none transition-colors ${
            activeTab === "donations"
              ? "border-b-4 border-red-500 text-red-500"
              : "text-gray-500 hover:text-red-400"
          }`}
        >
          {role === "admin" ? "📦 Manage Donations" : "📍 Pickup Dashboard"}
        </button>
      </div>

      {/* === USERS TAB === */}
      {role === "admin" && activeTab === "users" && (
        <div className="space-y-10">
          {/* NGO TABLE */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🏢 Registered NGOs{" "}
              <span className="text-sm font-normal text-gray-500">
                ({ngoUsers.length})
              </span>
            </h3>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-blue-50 text-left text-blue-800 uppercase text-sm tracking-wider">
                      <th className="px-5 py-3 font-semibold">Name / Email</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngoUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-5 py-5 text-center text-gray-500"
                        >
                          No NGOs found.
                        </td>
                      </tr>
                    ) : (
                      ngoUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            {user.isVerified ? (
                              <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                                ✔ Verified
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full">
                                ⏳ Pending
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 flex gap-2">
                            {!user.isVerified && (
                              <button
                                onClick={() => verifyUser(user._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DONOR TABLE */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ❤️ Registered Donors{" "}
              <span className="text-sm font-normal text-gray-500">
                ({donorUsers.length})
              </span>
            </h3>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600 uppercase text-sm tracking-wider">
                      <th className="px-5 py-3 font-semibold">Name / Email</th>
                      <th className="px-5 py-3 font-semibold">Phone</th>
                      <th className="px-5 py-3 font-semibold">Address</th>
                      <th className="px-5 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-5 text-center text-gray-500"
                        >
                          No Donors found.
                        </td>
                      </tr>
                    ) : (
                      donorUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {user.phone || "N/A"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {user.address || "N/A"}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === DONATIONS TAB === */}
      {activeTab === "donations" && (
        <div className="space-y-12">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📍 Active Pickups Map
            </h2>
            <DonationMap donations={activeDonations} />
          </div>

          {/* TABLE 1: ACTIVE PICKUPS */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {role === "admin"
                ? "All Active Donations"
                : "Active Items Near You (Closest First)"}
            </h3>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600 uppercase text-sm tracking-wider">
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Item
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Images
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Donor Location
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Distance
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Status
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDonations.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-5 py-5 text-center text-gray-500"
                        >
                          No active donations found.
                        </td>
                      </tr>
                    ) : (
                      activeDonations.map((d) => (
                        <tr
                          key={d._id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-5 py-5 text-sm font-medium">
                            {d.name}
                          </td>

                          {/* 👇 UPDATED: Click to Open Modal 👇 */}
                          <td className="px-5 py-5 text-sm">
                            {(d.images && d.images.length > 0) ||
                            (d.image && !d.image.includes("placeholder")) ? (
                              <button
                                onClick={() =>
                                  openImageModal(d.images, d.image)
                                }
                                className="flex flex-col items-center justify-center text-blue-600 hover:text-blue-800 hover:scale-105 transition transform cursor-pointer focus:outline-none"
                              >
                                <img
                                  src={
                                    d.images?.length > 0 ? d.images[0] : d.image
                                  }
                                  alt={d.name}
                                  className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200 mb-1"
                                />
                                <span className="text-xs font-bold">
                                  🔍 View{" "}
                                  {d.images?.length > 1
                                    ? `(${d.images.length})`
                                    : ""}
                                </span>
                              </button>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                No Image
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-5 text-sm text-gray-500">
                            {d.location || "Unknown"}
                          </td>

                          <td className="px-5 py-5 text-sm font-bold text-gray-700">
                            {d.distance !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100 whitespace-nowrap">
                                  🚗 {d.distance.toFixed(1)} km
                                </span>
                                {d.geometry?.coordinates?.length === 2 && (
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${d.geometry.coordinates[1]},${d.geometry.coordinates[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg hover:scale-110 transition transform inline-block"
                                    title="Navigate with Google Maps"
                                  >
                                    🗺️
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 font-normal italic">
                                N/A
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-5 text-sm">
                            <span
                              className={`px-3 py-1 font-semibold rounded-full text-xs ${
                                d.status === "Pending"
                                  ? "text-orange-900 bg-orange-200"
                                  : "text-blue-900 bg-blue-200"
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm">
                            {role === "admin" && (
                              <button
                                onClick={() => deleteDonation(d._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition mb-2 w-full"
                              >
                                Delete
                              </button>
                            )}

                            {role === "ngo" && d.status === "Pending" && (
                              <div className="flex flex-col gap-2">
                                {d.availableSlots &&
                                d.availableSlots.length > 0 ? (
                                  <select
                                    className="p-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                    onChange={(e) =>
                                      setSelectedSlots({
                                        ...selectedSlots,
                                        [d._id]: e.target.value,
                                      })
                                    }
                                    defaultValue=""
                                  >
                                    <option value="" disabled>
                                      Select Pickup Time...
                                    </option>
                                    {d.availableSlots.map((slot) => (
                                      <option key={slot} value={slot}>
                                        {slot}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-xs text-orange-500 font-medium italic text-center">
                                    No times provided.
                                    <br />
                                    Accept to coordinate later.
                                  </span>
                                )}
                                <button
                                  onClick={() =>
                                    updateDonationStatus(d._id, "Accepted")
                                  }
                                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition font-bold shadow-sm"
                                >
                                  Accept Pickup
                                </button>
                              </div>
                            )}

                            {role === "ngo" && d.status === "Accepted" && (
                              <div className="flex flex-col gap-2">
                                <span className="text-xs bg-blue-50 text-blue-800 p-1 rounded font-medium border border-blue-100 text-center">
                                  🕒 {d.pickupTime || "Time TBD"}
                                </span>
                                <button
                                  onClick={() =>
                                    updateDonationStatus(d._id, "Collected")
                                  }
                                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition font-bold shadow-sm"
                                >
                                  Mark Collected ✔️
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TABLE 2: PREVIOUSLY COLLECTED ITEMS */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ✅ Previously Collected Items
            </h3>
            <div className="bg-gray-50 shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-500 uppercase text-xs tracking-wider">
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Item
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Images
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Donor Location
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {collectedDonations.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-5 text-center text-gray-400 italic"
                        >
                          No collected items yet.
                        </td>
                      </tr>
                    ) : (
                      collectedDonations.map((d) => (
                        <tr
                          key={d._id}
                          className="border-b border-gray-200 hover:bg-white transition"
                        >
                          <td className="px-5 py-5 text-sm font-medium text-gray-600">
                            {d.name}
                          </td>

                          {/* 👇 UPDATED: Click to Open Modal in Collected Table 👇 */}
                          <td className="px-5 py-5 text-sm">
                            {(d.images && d.images.length > 0) ||
                            (d.image && !d.image.includes("placeholder")) ? (
                              <button
                                onClick={() =>
                                  openImageModal(d.images, d.image)
                                }
                                className="text-blue-500 hover:text-blue-700 text-xs font-bold underline cursor-pointer focus:outline-none"
                              >
                                🖼️ View Image{" "}
                                {d.images?.length > 1
                                  ? `(${d.images.length})`
                                  : ""}
                              </button>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                No Image
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-5 text-sm text-gray-500">
                            {d.location || "Unknown"}
                          </td>
                          <td className="px-5 py-5 text-sm">
                            <span className="px-3 py-1 font-semibold rounded-full text-xs text-green-900 bg-green-200">
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
