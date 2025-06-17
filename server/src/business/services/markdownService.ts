import { marked } from 'marked';
import hljs from 'highlight.js';
import sanitizeHtml from 'sanitize-html';

marked.use({
  gfm: true,
  breaks: true
});

export const renderMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  const rawHtml = marked.parse(markdown);
  
  const sanitizedHtml = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'span', 'kbd', 'pre', 'code'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id', 'style'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'a': ['href', 'name', 'target'],
      'pre': ['class'],
      'code': ['class']
    }
  });
  
  return sanitizedHtml;
};

export const enhanceHtml = (html: string): string => {
  let enhancedHtml = html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    '<div class="code-block"><div class="code-header"><span class="language">$1</span><button class="copy-button">Copy</button></div><pre><code class="language-$1">$2</code></pre></div>'
  );
  
  enhancedHtml = enhancedHtml
    .replace(
      /::: note\s+([\s\S]*?):::/g,
      '<div class="note-block"><div class="note-icon">ℹ️</div><div class="note-content">$1</div></div>'
    )
    .replace(
      /::: warning\s+([\s\S]*?):::/g,
      '<div class="warning-block"><div class="warning-icon">⚠️</div><div class="warning-content">$1</div></div>'
    )
    .replace(
      /::: tip\s+([\s\S]*?):::/g,
      '<div class="tip-block"><div class="tip-icon">💡</div><div class="tip-content">$1</div></div>'
    );
    
  return enhancedHtml;
};

export const processMarkdown = (markdown: string): string => {
  const sanitizedHtml = renderMarkdown(markdown);
  const enhancedHtml = enhanceHtml(sanitizedHtml);
  return enhancedHtml;
}; 