import { model } from "@/lib/gemini";
import { UsageMetadata } from "@google/generative-ai";

interface Page {
  title: string;
  content: string;
  pageNumber: number;
}

interface BookStructure {
  title: string;
  pages: Page[];
}

interface GenerateBookResult {
  book: BookStructure;
  usageMetadata?: UsageMetadata;
  creditsUsed: number
}


export async function generateBookContent(transcript: any, language: string): Promise<GenerateBookResult> {
  const prompt = `
    You are an expert textbook author. Your task is to convert the following video transcript into a structured textbook.
    
    The transcript is provided below. 
    
    Rules:
    1.  **Structure**: Create a book title and a series of pages (chapters/sections).
    2.  **Content**: Rewrite the transcript content into clear, educational, textbook-style text. Do not just copy the transcript. Use headings, paragraphs, and bullet points where appropriate within the page content.
    3.  **Pagination**: If the video is long or covers multiple distinct topics, split the content into multiple pages. Each page should focus on a specific sub-topic.
    4.  **Format**: Return the result strictly as a JSON object with the following schema:
    5.  **Creativity**: Feel free to enhance the content with examples, explanations, and clarifications to make it more educational and engaging for readers.
    6. **Language**: The content must be generated in the language specified by the input ${language} with preservation of the original meaning and cultural context and scientific accuracy and technical terminology.

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
    const usageMetadata = result.response.usageMetadata
    console.log(result.response.usageMetadata)
    const creditsUsed = Math.ceil(usageMetadata?.totalTokenCount! / 1000);
    // Clean up the response if it contains markdown code blocks
    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "");

    const book: BookStructure = JSON.parse(jsonString);
    return {
      book,
      usageMetadata,
      creditsUsed
    };
  } catch (error) {
    console.error("Error generating book content:", error);
    throw new Error("Failed to generate book content from transcript");
  }
}
