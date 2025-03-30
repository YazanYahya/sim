import ReactMarkdown from 'react-markdown'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose dark:prose-invert max-w-none prose-sm prose-p:leading-normal prose-pre:p-2 prose-pre:bg-muted/50 prose-pre:rounded-md">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
} 