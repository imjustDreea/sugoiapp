const ProfileCard = () => {
  return (
    <div className="bg-darkCard rounded-2xl p-6 shadow-card">
      <div className="flex flex-col items-center">
        <img
          src="https://via.placeholder.com/80"
          alt="profile"
          className="w-20 h-20 rounded-full border-4 border-accentPurple"
        />
        <h3 className="mt-3 text-lg font-semibold">OtakuGamer</h3>
        <p className="text-sm text-gray-400">Otaku | Gamer | Music lover</p>
      </div>

      <div className="mt-6 space-y-2 text-sm text-gray-300">
        <p className="flex justify-between"><span>📖 Mangas read</span><span>25</span></p>
        <p className="flex justify-between"><span>🎮 Games completed</span><span>10</span></p>
        <p className="flex justify-between"><span>🎵 Playlists created</span><span>8</span></p>
      </div>

      <button className="w-full mt-4 py-2 rounded-xl bg-[#232342] hover:bg-[#2b2b4a] transition">
        Edit profile
      </button>
    </div>
  );
};

export default ProfileCard;