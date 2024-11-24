import { AtomSpaceData, Node, Edge } from '../types';

const ATOMSPACE_API = 'http://localhost:5000/api';

export async function getAtomSpaceData(): Promise<AtomSpaceData> {
  const response = await fetch(`${ATOMSPACE_API}/atoms`);
  if (!response.ok) {
    throw new Error('Failed to fetch AtomSpace data');
  }
  return response.json();
}

export async function updateAtom(id: string, data: Partial<Node>): Promise<Node> {
  const response = await fetch(`${ATOMSPACE_API}/atoms/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update atom');
  }
  return response.json();
}

export async function createLink(source: string, target: string, type: string): Promise<Edge> {
  const response = await fetch(`${ATOMSPACE_API}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ source, target, type }),
  });
  if (!response.ok) {
    throw new Error('Failed to create link');
  }
  return response.json();
}