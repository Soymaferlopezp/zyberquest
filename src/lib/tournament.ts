const KEY = 'tournament_code';
export const API = process.env.NEXT_PUBLIC_API_BASE || 'http://192.168.100.12:3001';

export function setTournamentCode(code: string) {
  try { sessionStorage.setItem(KEY, code); } catch {}
}

export function getTournamentCode(): string | null {
  try { return sessionStorage.getItem(KEY); } catch { return null; }
}

export async function saveTournamentResult(input: {
  code: string;
  score: number;
  levelsPassed: number; // 0..3
  playedAt: string;     // ISO
}) {
  try {
    const res = await fetch(`${API}/api/tournament/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(input),
    });
    return res.ok;
  } catch {
    return false;
  }
}
