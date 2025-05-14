import React from 'react';

type Props = {
  onClick: () => void;
  title: string;
};

const AuthButton: React.FC<Props> = ({ onClick, title }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 cursor-pointer rounded-lg bg-primary text-white hover:bg-secondary transition-all shadow-sm"
    >
      {title}
    </button>
  );
};

export default AuthButton;