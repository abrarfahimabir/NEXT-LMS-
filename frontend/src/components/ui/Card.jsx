import React from "react";

const Card = ({ children, className = "" }) => (
  <div className={`ui-card ${className}`.trim()}>
    <div className="ui-card__body">{children}</div>
  </div>
);

export default Card;
