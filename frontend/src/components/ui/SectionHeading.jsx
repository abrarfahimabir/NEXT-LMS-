import React from "react";

const SectionHeading = ({ eyebrow, title, description, action, gradientTitle = false }) => (
  <div className="ui-heading">
    {eyebrow ? <div className="ui-badge ui-heading__eyebrow">{eyebrow}</div> : null}
    <div className="row-between">
      <div>
        <h2 className={`ui-heading__title ${gradientTitle ? "ui-heading__title--gradient" : ""}`.trim()}>
          {title}
        </h2>
        {description ? <p className="ui-heading__text">{description}</p> : null}
      </div>
      {action}
    </div>
  </div>
);

export default SectionHeading;
