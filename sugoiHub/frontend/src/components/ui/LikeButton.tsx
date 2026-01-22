import React from "react";

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onClick: () => void;
  className?: string;
  ariaPressed?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ liked, count, onClick, className = "", ariaPressed }) => (
  <button
    type="button"
    className={`pixel-btn pixel-btn-secondary pixel-btn-sm flex items-center justify-center gap-1 ${className}`}
    onClick={onClick}
    aria-pressed={ariaPressed}
  >
    {liked ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#BFFF00" style={{display:'inline',verticalAlign:'middle'}}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{display:'inline',verticalAlign:'middle'}}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    )}
    <span className="ml-1">{count}</span>
  </button>
);

export default LikeButton;
