/**
 * Rich Text Editor Backend Integration Example
 * 
 * This file demonstrates how the Rich Text Editor integrates with your backend
 * while maintaining security and preserving formatting.
 */

// Example: How the Rich Text Editor sends data to backend
export interface RichTextData {
  id: string;
  title: string;
  content: string; // This contains sanitized HTML
  createdAt: string;
  updatedAt: string;
}

// Example API service method for saving rich text content
export class ContentService {
  async saveContent(data: { title: string; content: string }): Promise<RichTextData> {
    // The content here is already sanitized HTML from the Rich Text Editor
    // It contains formatting like: <p style="color: red;"><strong>Bold text</strong></p>
    
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secureTokenService.getAccessToken()}`
      },
      body: JSON.stringify({
        title: data.title,
        content: data.content // Sanitized HTML with formatting preserved
      })
    });
    
    return response.json();
  }
  
  async getContent(id: string): Promise<RichTextData> {
    const response = await fetch(`/api/content/${id}`, {
      headers: {
        'Authorization': `Bearer ${secureTokenService.getAccessToken()}`
      }
    });
    
    return response.json();
  }
}

// Example: How to display rich text content safely
export function RichTextDisplay({ content }: { content: string }) {
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
      // Note: This is safe because content is already sanitized
    />
  );
}

// Example: Complete form with Rich Text Editor
export function ContentForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const contentService = new ContentService();
      await contentService.saveContent({ title, content });
      
      // Success! The content is now saved with all formatting preserved
      appLogger.log('Content saved successfully');
    } catch (error) {
      appLogger.error('Failed to save content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label htmlFor="content">Content</label>
        <RichTextEditor
          value={content}
          onChange={setContent} // This receives sanitized HTML
          placeholder="Write your content here..."
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Content'}
      </button>
    </form>
  );
}

// Example: Backend API endpoint (Node.js/Express)
/*
app.post('/api/content', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // The content here is sanitized HTML like:
    // "<p style='color: red;'><strong>Bold text</strong></p>"
    
    const savedContent = await db.content.create({
      title,
      content, // Store the HTML directly
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json(savedContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save content' });
  }
});

app.get('/api/content/:id', async (req, res) => {
  try {
    const content = await db.content.findById(req.params.id);
    
    // Return the HTML content - it's already sanitized
    res.json(content);
  } catch (error) {
    res.status(404).json({ error: 'Content not found' });
  }
});
*/

// Example: Database schema (if using Prisma)
/*
model Content {
  id        String   @id @default(cuid())
  title     String
  content   String   // This stores HTML content
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
*/

// Example: What the HTML content looks like
export const exampleContent = `
<p style="color: #ff0000; font-size: 18px;">
  <strong>This is bold red text</strong>
</p>
<p>
  <em>This is italic text</em> and 
  <u>this is underlined</u>
</p>
<ul>
  <li style="color: blue;">Blue bullet point</li>
  <li style="color: green;">Green bullet point</li>
</ul>
<blockquote style="border-left: 4px solid #ccc; padding-left: 16px;">
  This is a quote with custom styling
</blockquote>
<p>
  <a href="https://example.com" style="color: #0066cc;">
    This is a safe link
  </a>
</p>
`;

// Example: How to render the content in a page
export function ContentPage({ contentId }: { contentId: string }) {
  const [content, setContent] = useState<RichTextData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const contentService = new ContentService();
        const data = await contentService.getContent(contentId);
        setContent(data);
      } catch (error) {
        appLogger.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [contentId]);
  
  if (loading) return <div>Loading...</div>;
  if (!content) return <div>Content not found</div>;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
      
      {/* This displays the formatted content safely */}
      <RichTextDisplay content={content.content} />
      
      <div className="mt-8 text-sm text-gray-500">
        Last updated: {new Date(content.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
