// GitHub README loader
const githubReadmeUrl = 'https://raw.githubusercontent.com/carmoran0/carmoran0/refs/heads/main/README.md';

// Function to convert markdown to HTML (basic conversion)
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Code blocks (must be done first to protect content)
    html = html.replace(/```[\s\S]*?```/gim, (match) => {
        const code = match.slice(3, -3).trim();
        return `<pre><code>${code}</code></pre>`;
    });
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;height:auto;">');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Headers (must be done before bold/italic to avoid conflicts)
    html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');
    
    // Bold (before italic to handle *** correctly)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
    
    // Wrap consecutive <li> items in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        return '<ul>' + match + '</ul>';
    });
    
    // Convert double line breaks to paragraph breaks
    html = html.split('\n\n').map(paragraph => {
        paragraph = paragraph.trim();
        if (!paragraph) return '';
        // Don't wrap if already has block-level tags
        if (paragraph.match(/^<(h[1-6]|pre|ul|ol|blockquote|div)/i)) {
            return paragraph;
        }
        return '<p>' + paragraph.replace(/\n/g, ' ') + '</p>';
    }).join('\n');
    
    return html;
}

// Function to fetch and display GitHub README
async function loadGitHubReadme() {
    const readmeContainer = document.getElementById('readme-content');
    
    if (!readmeContainer) {
        console.error('README container not found');
        return;
    }
    
    try {
        const response = await fetch(githubReadmeUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const markdownText = await response.text();
        const htmlContent = convertMarkdownToHTML(markdownText);
        
        readmeContainer.innerHTML = htmlContent;
        
    } catch (error) {
        console.error('Error loading GitHub README:', error);
        readmeContainer.innerHTML = `
            <p style="color: #ff6b6b;">No se pudo cargar el README de GitHub.</p>
            <p style="font-size: 0.9em; opacity: 0.7;">Error: ${error.message}</p>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadGitHubReadme();
});
