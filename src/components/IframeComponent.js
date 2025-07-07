import React from 'react';

const IframeComponent = ({ src, title }) => {
  return (
    <iframe
      src={src}
      title={title}
      width="100%"
      height="500px"
      style={{ border: 'none' }}
    ></iframe>
  );
};

export default IframeComponent;