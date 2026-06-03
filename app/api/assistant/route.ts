import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

interface Institution {
  id: string;
  category: string;
  category_name_ar: string;
  category_name_fr: string;
  name_ar: string;
  name_fr?: string;
  commune_ar: string;
  commune_fr: string;
  wilaya: string;
  phone: string | null;
  email: string | null;
  activity_tags: string[];
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Load dataset
    const jsonDirectory = path.join(process.cwd());
    const fileContents = await fs.readFile(jsonDirectory + '/odej_bejaia_dataset.json', 'utf8');
    const dataset = JSON.parse(fileContents);
    
    const institutions: Institution[] = dataset.institutions;
    
    // Very simple keyword extraction and matching
    const normalizedQuery = query.toLowerCase().trim();
    const keywords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
    
    if (keywords.length === 0) {
      return NextResponse.json({ 
        message: "Please ask a more specific question.",
        results: []
      });
    }

    // Score institutions based on keyword matches
    const scoredInstitutions = institutions.map(inst => {
      let score = 0;
      const searchableText = `
        ${inst.name_ar || ''} ${inst.name_fr || ''} 
        ${inst.commune_ar || ''} ${inst.commune_fr || ''} 
        ${inst.category_name_ar || ''} ${inst.category_name_fr || ''}
        ${inst.wilaya || ''}
        ${inst.activity_tags.join(' ')}
      `.toLowerCase();

      keywords.forEach(keyword => {
        if (searchableText.includes(keyword)) {
          score += 1;
        }
      });

      return { institution: inst, score };
    });

    // Filter and sort by score
    const matchedInstitutions = scoredInstitutions
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.institution)
      .slice(0, 5); // Return top 5 matches

    let message = '';
    if (matchedInstitutions.length === 0) {
      message = "I'm sorry, I couldn't find any information matching your query in the ODEJ dataset. Please try using different keywords like a commune name (e.g., Akbou) or an activity (e.g., sport, theatre).";
    } else {
      message = `I found ${matchedInstitutions.length} result(s) based on your question:`;
    }

    return NextResponse.json({
      message,
      results: matchedInstitutions
    });

  } catch (error) {
    console.error("Assistant API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
