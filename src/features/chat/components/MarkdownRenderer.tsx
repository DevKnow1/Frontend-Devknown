import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { codeToHtml } from 'shiki';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    codeToHtml(code, {
      lang: language || 'text',
      theme: 'github-dark',
    })
      .then((html) => {
        if (active) setHighlightedHtml(html);
      })
      .catch(() => {
        // Si el lenguaje no está soportado por Shiki, se muestra el <pre> plano
        if (active) setHighlightedHtml('');
      });

    return () => {
      active = false;
    };
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
        <span className="font-mono uppercase">{language || 'código'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {highlightedHtml ? (
        <div
          className="overflow-x-auto p-3 text-xs leading-relaxed [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="overflow-x-auto p-3 text-xs leading-relaxed font-mono">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

/**
 * Transforma citas como [1] en enlaces internos (#source-1) respetando
 * bloques de código ```...``` y código en línea `...` para no alterar arrays como arr[1].
 */
function injectCitationLinks(markdown: string): string {
  const segments = markdown.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return segments
    .map((segment, idx) => {
      // Los índices impares corresponden a bloques/líneas de código
      if (idx % 2 === 1) return segment;
      return segment.replace(/\[(\d+)\](?!\()/g, '[$1](#source-$1)');
    })
    .join('');
}

interface MarkdownRendererProps {
  content: string;
  onSelectSource?: (sourceIndex: number) => void;
}

export function MarkdownRenderer({
  content,
  onSelectSource,
}: MarkdownRendererProps) {
  const processedContent = useMemo(
    () => injectCitationLinks(content),
    [content]
  );

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            if (href?.startsWith('#source-')) {
              const index = Number(href.replace('#source-', ''));
              return (
                <button
                  type="button"
                  onClick={() => onSelectSource?.(index)}
                  title={`Ver fuente documental [${index}]`}
                  className="mx-0.5 inline-flex items-center rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer align-baseline"
                >
                  [{children}]
                </button>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                {children}
              </a>
            );
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const rawCode = String(children).replace(/\n$/, '');
            const isBlock = Boolean(match) || rawCode.includes('\n');

            if (isBlock) {
              return <CodeBlock language={match?.[1] ?? ''} code={rawCode} />;
            }

            return (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}