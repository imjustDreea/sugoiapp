const RecommendationCard= () => {
  return (
    <div className="bg-darkCard rounded-2xl p-6 shadow-card">
      <h4 className="text-lg font-semibold mb-4">Recommendation of the day</h4>
      <div className="h-32 bg-dark rounded-xl flex items-center justify-center text-gray-500">
        Featured content
      </div>
      <button className="mt-4 w-full py-2 rounded-xl text-accentPurple hover:text-accentPink transition">
        See more recommendations
      </button>
    </div>
  );
};

export default RecommendationCard;
