const MainCard= () => {
  return (
    <section className="flex-1 bg-darkCard rounded-2xl p-10 flex flex-col justify-center items-center text-center shadow-card">
      <div className="text-6xl text-accentPurple mb-6">愛</div>
      <h2 className="text-2xl font-semibold mb-2">Welcome to SugoiHub</h2>
      <p className="text-gray-400 max-w-md mb-6">
        Your ultimate platform for manga, games, and music. Explore, discover, and connect with fellow enthusiasts.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-2 rounded-xl bg-linear-to-r from-accentPurple to-accentPink font-semibold">
          Get Started
        </button>
        <button className="px-6 py-2 rounded-xl border border-gray-600 hover:border-accentPurple transition">
          Learn More
        </button>
      </div>
    </section>
  );
};

export default MainCard;
