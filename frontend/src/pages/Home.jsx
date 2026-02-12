import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- HERO SECTION --- */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Donate for a <span className="text-red-500">Better World</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
            Connect directly with verified NGOs. Your unused items can bring a
            smile to someone's face today.
          </p>

          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-red-600 transition transform hover:-translate-y-1"
            >
              Start Donating
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-800 border border-gray-300 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500 mt-2">
            Simple steps to make a big impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 text-center border border-gray-100">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📦
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              1. List Your Item
            </h3>
            <p className="text-gray-600">
              Take a photo and add details of your donation. It takes less than
              a minute.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 text-center border border-gray-100">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🤝
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              2. NGO Accepts
            </h3>
            <p className="text-gray-600">
              Verified NGOs nearby will see your donation and accept it
              instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 text-center border border-gray-100">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🚚
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              3. Pickup & Joy
            </h3>
            <p className="text-gray-600">
              The NGO collects the item from your doorstep. You spread
              happiness!
            </p>
          </div>
        </div>
      </div>

      {/* --- STATS SECTION (Optional) --- */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-4xl font-bold text-red-500">100+</h4>
            <p className="text-gray-400 mt-2">Verified NGOs</p>
          </div>
          <div>
            <h4 className="text-4xl font-bold text-red-500">5,000+</h4>
            <p className="text-gray-400 mt-2">Donations Completed</p>
          </div>
          <div>
            <h4 className="text-4xl font-bold text-red-500">10,000+</h4>
            <p className="text-gray-400 mt-2">Happy Faces</p>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
          <p>© 2026 Smart Donation Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
