import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // console.log(process.cwd());
  const filePath = path.join(process.cwd(), 'questions.json');

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);
    return NextResponse.json(questions["sections"]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
