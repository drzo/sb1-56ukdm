import React from 'react';

interface SearchButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
    >
      Search Patterns
    </button>
  );
};