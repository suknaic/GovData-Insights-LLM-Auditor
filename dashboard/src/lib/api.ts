const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function summarizeEdital(text: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/analyze/edital`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.summary;
}

export async function analyzeRisk(text: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_URL}/api/analyze/risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function extractEntities(text: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_URL}/api/analyze/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeDocument(files: File[]): Promise<Record<string, unknown>> {
  const formData = new FormData();
  for (const file of files.slice(0, 3)) {
    formData.append('files', file);
  }
  const res = await fetch(`${API_URL}/api/analyze/document`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.analysis;
}
