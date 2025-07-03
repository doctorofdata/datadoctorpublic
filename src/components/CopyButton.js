import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const CopyButton = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const onCopyHandler = (text, result) => {
    if (result) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      alert('Failed to copy text. Please try again.');
    }
  };
  
  return (
    <CopyToClipboard text={textToCopy} onCopy={onCopyHandler}>
      <button>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</button>
    </CopyToClipboard>
  );
};

export default CopyButton;