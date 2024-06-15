import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  const filePath = path.join(process.cwd(), 'final.json');
  const body = await req.json();

  print(body)

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const resp = JSON.parse(data);

    // Check if the key exists in the JSON object
    if (resp.hasOwnProperty(body["key"])) {
      // If the key exists, return the corresponding array
      const responseData = resp[body["key"]];
      return NextResponse.json(responseData);
    } else {
      // If the key does not exist, return an error response
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
