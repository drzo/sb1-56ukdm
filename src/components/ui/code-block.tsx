import React, { memo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  content: string;
  language?: string;
}

export const CodeBlock = memo(({ content, language = 'python' }: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className={cn(
        "absolute right-2 top-2 transition-opacity",
        "opacity-0 group-hover:opacity-100"
      )}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <pre className={cn(
        "bg-gray-900 text-gray-100 rounded-lg p-4",
        "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700",
        "font-mono text-sm leading-relaxed"
      )}>
        <code className={`language-${language}`}>
          {content}
        </code>
      </pre>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';