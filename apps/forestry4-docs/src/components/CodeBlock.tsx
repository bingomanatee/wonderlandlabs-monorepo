import React from 'react';
import CodePanel from './CodePanel';

type CodeBlockProps = {
  title?: string;
  language: string;
  code?: string;
  children?: React.ReactNode;
  // Snippet loading props
  snippetName?: string;
  folder?: string;
  ts?: boolean; // Use .ts extension instead of .tsx.txt
};



const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  language,
  code,
  children,
  snippetName,
  folder,
  ts,
}) => {
  return (
    <CodePanel
      title={title}
      language={language}
      content={code}
      snippetName={snippetName}
      folder={folder}
      ts={ts}
    >
      {children}
    </CodePanel>
  );
};

export default CodeBlock;
