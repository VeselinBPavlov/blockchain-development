import React from "react";

import "./Button.css"; // Import CSS file for styles

const Button = ({ handleClick, text, disabled }) => {
  return (
    <button
      disabled={disabled}
      className='connect-button'
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default Button;
