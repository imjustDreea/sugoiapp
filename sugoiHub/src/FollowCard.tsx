import logo from './assets/sugoi-logo.png';
import type { ReactNode } from 'react';
import { useState } from 'react';


export function FollowCard({userName, children}: { userName: string; children?: ReactNode }) {
const [isFollowingState, setIsFollowingState] = useState(false);

    return (
    <article className="flex items-center justify-between bg-white shadow-md rounded-2xl p-4 w-full max-w-sm border border-gray-200">
      {/* Header con avatar e info */}
      <header className="flex items-center gap-3 flex-1 min-w-0">
      <img
        src={logo}
        alt="SugoiHub Logo"
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex flex-col min-w-0 flex-1">
        <strong className="text-gray-900 font-semibold truncate">{children}</strong>
        <span className="text-gray-500 text-sm truncate">@{userName}</span>
      </div>
      </header>

      {/* Botón de seguir */}
      <aside className="flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsFollowingState(prev => !prev)}
        className={`text-sm font-semibold px-4 py-1.5 rounded-full transition whitespace-nowrap ${
          isFollowingState
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {isFollowingState ? 'Siguiendo' : 'Seguir'}
      </button>
      </aside>
    </article>
  )
}

export default FollowCard;
