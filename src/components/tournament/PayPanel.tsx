// components/tournament/PayPanel.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddressBox from './AddressBox';
import MemoBox from './MemoBox';
import QrBox from './QrBox';
import NetworkBar from './NetworkBar';
import { FALLBACK_UA, buildZcashURI } from '@/lib/coin';
import { useToast } from '@/components/ui/use-toast';

type NewCoinResponse = {
  code?: string;       // memo (SIEMPRE viene del backend)
  address?: string;    // UA
  zcashURI?: string;   // opcional si backend ya lo arma
  expiresAt?: string;  // ISO
};

type StatusValue = 'PENDING' | 'CONFIRMED' | 'EXPIRED';

type StatusResponse = {
  status: StatusValue;
  confirmations?: number;   // 0..1
  blockHeight?: number;     // opcional
};

const POLL_MS = 10_000;
const SLOW_WARN_MS = 150_000; // 2.5 minutes
const PRICE_LABEL = '0.001 ZEC';

// ← Base del backend: usa .env.local (NEXT_PUBLIC_API_BASE) o IP por defecto
const API =
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://192.168.100.12:3001';

export default function PayPanel() {
  const router = useRouter();
  const { toast } = useToast();

  // ===== Base session =====
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [data, setData]     = useState<NewCoinResponse | null>(null);

  // SIN memo local: todo viene del backend
  const ua   = data?.address || FALLBACK_UA;
  const memo = data?.code    || ''; // si aún no llegó el backend, mostramos vacío

  // URI: preferimos la del backend; si no viene, la construimos solo si ya hay address+memo
  const uri = useMemo(() => {
    if (data?.zcashURI) return data.zcashURI;
    if (ua && memo) return buildZcashURI(ua, memo);
    return '';
  }, [data?.zcashURI, ua, memo]);

  // ===== Status & network =====
  const [status, setStatus] = useState<StatusValue>('PENDING');
  const [confirmations, setConfirmations] = useState(0); // 0..1
  const [blockHeight, setBlockHeight] = useState(0);

  const createdRef  = useRef(false);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const slowWarnRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===== Start session (POST /api/coin/new) =====
  useEffect(() => {
    if (createdRef.current) return; // evita doble POST en dev/StrictMode
    createdRef.current = true;

    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // ⬇️ Llama al backend por IP (o por NEXT_PUBLIC_API_BASE)
        const res = await fetch(`${API}/api/coin/new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
        const json = (await res.json()) as NewCoinResponse;
        setData(json); // ← {code, address, zcashURI, expiresAt}
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Failed to start payment session');
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  // ===== Polling /api/coin/status?code=... =====
  useEffect(() => {
    if (!memo) return; // solo empezamos a sondear cuando ya tenemos el code del backend
    if (status === 'CONFIRMED' || status === 'EXPIRED') return;

    // slow network warning at 2.5 min
    if (!slowWarnRef.current) {
      slowWarnRef.current = setTimeout(() => {
        if (status === 'PENDING') {
          toast({
            title: 'Network is slower than usual',
            description: 'Keep this tab open. We’ll confirm as soon as the payment is detected.',
          });
        }
      }, SLOW_WARN_MS);
    }

    async function fetchStatus() {
      try {
        const res = await fetch(
          `${API}/api/coin/status?code=${encodeURIComponent(memo)}`,
          { method: 'GET', cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
        const json = (await res.json()) as StatusResponse;

        if (typeof json.blockHeight === 'number') setBlockHeight(json.blockHeight);
        if (typeof json.confirmations === 'number') setConfirmations(Math.max(0, Math.min(1, json.confirmations)));

        if (json.status === 'CONFIRMED') {
          setStatus('CONFIRMED');
          setConfirmations(1);
        } else if (json.status === 'EXPIRED') {
          setStatus('EXPIRED');
        } else {
          setStatus('PENDING');
        }
      } catch {
        // error transitorio: reintenta en el siguiente tick
      }
    }

    // primer tiro inmediato + intervalo
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, POLL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      if (slowWarnRef.current) {
        clearTimeout(slowWarnRef.current);
        slowWarnRef.current = null;
      }
    };
  }, [memo, status, toast]);

  const expiresHuman = useMemo(() => {
    if (!data?.expiresAt) return null;
    const d = new Date(data.expiresAt);
    return Number.isNaN(d.getTime())
      ? null
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [data?.expiresAt]);

  const canPlay = status === 'CONFIRMED';

  function handlePlay() {
    if (!canPlay) return;
    router.push(`/tournament/play?code=${encodeURIComponent(memo)}`);
  }

  return (
    <Card className="flex w-full flex-col gap-4 border-zinc-800/60 bg-zinc-950/60" role="form" aria-describedby="payment-desc">
      <CardHeader>
        <CardTitle className="text-xl">Tournament — Insert Coin</CardTitle>
        <p id="payment-desc" className="text-sm text-zinc-400">
          Pay to enter the tournament mode. Keep this page open.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Price */}
        <div className="grid grid-cols-2 items-center gap-3">
          <div className="text-zinc-400">Price</div>
          <div className="justify-self-end font-mono">{PRICE_LABEL}</div>
        </div>

        {/* Session status line */}
        <div className="min-h-5 text-xs" aria-live="polite">
          {loading && <span role="status" className="text-zinc-400">Initializing payment session…</span>}
          {!loading && error && <span role="alert" className="text-amber-400">{error}</span>}
          {!loading && !error && status === 'PENDING' && (
            <span className="text-zinc-500">Waiting for on-chain confirmation…</span>
          )}
          {!loading && !error && status === 'CONFIRMED' && (
            <span className="text-emerald-400">Coin inserted ✓</span>
          )}
          {!loading && !error && status === 'EXPIRED' && (
            <span className="text-amber-400">Session expired. Refresh to start a new one.</span>
          )}
          {!loading && !error && expiresHuman && (
            <span className="ml-2 text-zinc-500">
              (expires ~<span className="font-mono">{expiresHuman}</span>)
            </span>
          )}
        </div>

        {/* UA & Memo */}
        <AddressBox address={ua} loading={loading} />
        <MemoBox memo={memo} loading={loading || !memo} />

        {/* QR */}
        <QrBox zcashURI={uri} loading={loading || !memo} />

        {/* Network / Progress */}
        <NetworkBar
          blockHeight={blockHeight}
          etaSecondsPerBlock={75}
          confirmations={confirmations}
        />

        {/* CTA */}
        <Button
          type="button"
          className="w-full"
          disabled={!canPlay}
          aria-disabled={!canPlay}
          aria-live="polite"
          onClick={handlePlay}
        >
          {canPlay ? 'PLAY' : 'Waiting for confirmation…'}
        </Button>
      </CardContent>
    </Card>
  );
}
