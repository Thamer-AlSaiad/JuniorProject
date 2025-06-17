export const markdownToHtml = (content: string) => {
  if (!content) return "";
  

  let processedContent = content
    .replace(/Copy/g, '') 
    .replace(/Copy/g, ''); 
  
  processedContent = processedContent.replace(/```(\w*)\s*([\s\S]*?)```/g, (_, language, code) => {
    let lang = 'Code';
    if (language) {
      lang = language.charAt(0).toUpperCase() + language.slice(1);
    } else {
      if (code.trim().match(/^(pip|python|conda|npm|git|cd|ls|dir)\s/)) {
        lang = 'Terminal';
      } else if (code.includes('import ') || code.includes('print(') || code.includes('def ')) {
        lang = 'Python';
      }
    }
    
    return createPerfectCodeBlock(code, lang);
  });
  
  function createPerfectCodeBlock(code: string, language: string) {
    return `
    <div class="my-6 mx-0 shadow-md">
      <div class="flex items-center justify-between px-4 py-2.5 bg-[#2a2339] border-b border-[#3d3450] rounded-t-md">
        <span class="text-sm font-medium text-[#d4cce2]">${language}</span>
        <span class="text-xs text-[#9a8fb8] opacity-70">code</span>
      </div>
      <pre class="bg-[#1f1a2e] py-4 px-5 rounded-b-md overflow-x-auto border-x border-b border-[#2f2a3f]"><code class="font-mono text-[#d4cce2] text-[14px] leading-[1.7] tracking-normal">${code}</code></pre>
    </div>`;
  }
  

  processedContent = processedContent.replace(/`([^`]+)`/g, '<code class="bg-[#1f1a2e] text-[#d4cce2] px-1.5 py-0.5 rounded font-mono text-sm">$1</code>');
  
  
  processedContent = processedContent.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#f8f5ff] mt-8 mb-5 leading-tight">$1</h1>');
  processedContent = processedContent.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#f8f5ff] mt-7 mb-4 leading-tight">$1</h2>');
  processedContent = processedContent.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[#f8f5ff] mt-6 mb-3 leading-tight">$1</h3>');
  
  
  processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#bb86fc] hover:underline hover:text-[#d7b8ff] transition-colors duration-150">$1</a>');
  
  
  processedContent = processedContent.replace(/^\* (.+)$/gm, '<li class="text-[#d4cce2] ml-6 mb-2.5 leading-relaxed">$1</li>');
  
  
  processedContent = processedContent.replace(/^(\d+)\. (.+)$/gm, '<li class="text-[#d4cce2] ml-6 mb-2.5 leading-relaxed">$2</li>');
  
  
  const wrapLists = (html: string) => {
    let result = html;
    

    const ulRegex = /(<li class="[^>]*">.*?<\/li>[\s]*)+/gs;
    const ulMatches = result.match(ulRegex) || [];
    ulMatches.forEach(match => {
      if (!match.includes('<ul') && !match.includes('<ol')) {
        result = result.replace(match, `<ul class="list-disc mb-6 mt-4 text-[#d4cce2]">${match}</ul>`);
      }
    });
    
    const olRegex = /(<li class="[^>]*">.*?<\/li>[\s]*)+/gs;
    const olMatches = result.match(olRegex) || [];
    olMatches.forEach(match => {
      if (!match.includes('<ul') && !match.includes('<ol')) {
        result = result.replace(match, `<ol class="list-decimal mb-6 mt-4 text-[#d4cce2]">${match}</ol>`);
      }
    });
    
    return result;
  };
  
  processedContent = processedContent.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="text-[#d4cce2] mb-5 leading-relaxed">$1</p>');
  
  processedContent = wrapLists(processedContent);
  
  processedContent = processedContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  
  return `
  <style>
    /* Base theme colors */
    .lesson-content {
      color: #d4cce2 !important;
      /* Removed background-color to make it transparent */
      font-family: 'nokio';
      line-height: 1.6 !important;
      letter-spacing: 0.015em !important;
      max-width: 860px !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }
    
    /* Text elements */
    h1, h2, h3, h4, h5, h6 {
      color: #f8f5ff !important;
      font-weight: 700 !important;
      line-height: 1.3 !important;
      margin-top: 1.5em !important;
      margin-bottom: 0.75em !important;
      letter-spacing: -0.01em !important;
    }
    
    h1 { font-size: 1.75rem !important; }
    h2 { font-size: 1.5rem !important; }
    h3 { font-size: 1.25rem !important; }
    
    p, li, ul, ol, span, div {
      color: #d4cce2 !important;
    }
    
    p {
      margin-bottom: 1.25rem !important;
      line-height: 1.7 !important;
    }
    
    /* Code elements - keeping their background colors */
    pre {
      background-color: #1f1a2e !important;
      border-radius: 0 0 6px 6px !important;
      padding: 16px 20px !important;
      margin: 0 !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace !important;
      border-left: 1px solid #2f2a3f !important;
      border-right: 1px solid #2f2a3f !important;
      border-bottom: 1px solid #2f2a3f !important;
      overflow-x: auto !important;
    }
    
    .code-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 10px 16px !important;
      background-color: #2a2339 !important;
      color: #d4cce2 !important;
      border-radius: 6px 6px 0 0 !important;
      border: 1px solid #3d3450 !important;
      font-size: 14px !important;
    }
    
    pre code {
      font-family: 'nokio';
      color: #d4cce2 !important;
      font-size: 14px !important;
      line-height: 1.7 !important;
      white-space: pre !important;
    }
    
    code {
      font-family: 'nokio' ;
      background-color: #1f1a2e !important;
      color: #d4cce2 !important;
      border-radius: 4px !important;
      padding: 0.15em 0.4em !important;
      font-size: 0.9em !important;
    }
    
    /* Links */
    a {
      color: #bb86fc !important;
      text-decoration: none !important;
      font-weight: 500 !important;
      transition: color 0.15s ease-in-out !important;
    }
    
    a:hover {
      color: #d7b8ff !important;
      text-decoration: underline !important;
    }
    
    /* Lists */
    ul, ol {
      color: #d4cce2 !important;
      margin-bottom: 1.5rem !important;
      margin-top: 1rem !important;
    }
    
    li {
      margin-bottom: 0.75rem !important;
      line-height: 1.6 !important;
    }
    
    /* Refinements */
    blockquote {
      border-left: 4px solid #593797 !important;
      padding-left: 1rem !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      font-style: italic !important;
      color: #b8afcc !important;
    }
    
    hr {
      border: 0 !important;
      border-top: 1px solid #3d3450 !important;
      margin: 2rem 0 !important;
    }
    
    img {
      max-width: 100% !important;
      border-radius: 6px !important;
      margin: 1.5rem 0 !important;
    }
    
    strong {
      color: #f8f5ff !important;
      font-weight: 600 !important;
    }
    
    em {
      color: #d7b8ff !important;
    }
    
    table {
      border-collapse: collapse !important;
      width: 100% !important;
      margin: 1.5rem 0 !important;
    }
    
    th, td {
      border: 1px solid #3d3450 !important;
      padding: 0.75rem !important;
      text-align: left !important;
    }
    
    th {
      background-color: #2a2339 !important;
      color: #f8f5ff !important;
      font-weight: 600 !important;
    }
    
    tr:nth-child(even) {
      background-color: #231c31 !important;
    }
  </style>
  <div class="lesson-content">
    ${processedContent}
  </div>
  `;
}; 