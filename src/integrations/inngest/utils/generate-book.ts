import { model } from "@/lib/gemini";

interface Page {
  title: string;
  content: string;
  pageNumber: number;
}

interface BookStructure {
  title: string;
  pages: Page[];
}

export async function generateBookContent(transcript: any): Promise<BookStructure> {
  const prompt = `
    You are an expert textbook author. Your task is to convert the following video transcript into a structured textbook.
    
    The transcript is provided below. 
    
    Rules:
    1.  **Structure**: Create a book title and a series of pages (chapters/sections).
    2.  **Content**: Rewrite the transcript content into clear, educational, textbook-style text. Do not just copy the transcript. Use headings, paragraphs, and bullet points where appropriate within the page content.
    3.  **Pagination**: If the video is long or covers multiple distinct topics, split the content into multiple pages. Each page should focus on a specific sub-topic.
    4.  **Format**: Return the result strictly as a JSON object with the following schema:
    {
      "title": "Book Title",
      "pages": [
        {
          "title": "Page/Chapter Title",
          "content": "The educational content for this page...",
          "pageNumber": 1
        },
        ...
      ]
    }
    
    Transcript:
    ${JSON.stringify(transcript)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response if it contains markdown code blocks
    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "");
    
    const bookData: BookStructure = JSON.parse(jsonString);
    return bookData;
  } catch (error) {
    console.error("Error generating book content:", error);
    throw new Error("Failed to generate book content from transcript");
  }
}
