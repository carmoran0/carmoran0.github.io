export const useGithubReadme = () => {
  const githubReadmeUrl = 'https://raw.githubusercontent.com/carmoran0/carmoran0/refs/heads/main/README.md'

  const convertMarkdownToHTML = (markdown) => {
    let html = markdown
    
    // Code blocks
    html = html.replace(/```[\s\S]*?```/gim, (match) => {
      const code = match.slice(3, -3).trim()
      return `<pre><code>${code}</code></pre>`
    })
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;height:auto;">')
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Headers
    html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>')
    
    // Bold
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    html = html.replace(/_(.+?)_/g, '<em>$1</em>')
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>')
    html = html.replace(/^- (.+)$/gim, '<li>$1</li>')
    
    // Wrap consecutive <li> items in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      return '<ul>' + match + '</ul>'
    })
    
    // Convert double line breaks to paragraph breaks
    html = html.split('\n\n').map(paragraph => {
      paragraph = paragraph.trim()
      if (!paragraph) return ''
      if (paragraph.startsWith('<') || paragraph.includes('<h') || paragraph.includes('<ul>') || paragraph.includes('<pre>')) {
        return paragraph
      }
      return '<p>' + paragraph + '</p>'
    }).join('\n')
    
    return html
  }

  const loadReadme = async () => {
    const container = document.getElementById('readme-content')
    
    if (!container) return
    
    try {
      const response = await fetch(githubReadmeUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const markdown = await response.text()
      const html = convertMarkdownToHTML(markdown)
      
      container.innerHTML = html
    } catch (error) {
      console.error('Error loading GitHub README:', error)
      container.innerHTML = '<p>Error al cargar el README de GitHub</p>'
    }
  }

  return {
    loadReadme,
    convertMarkdownToHTML
  }
}
