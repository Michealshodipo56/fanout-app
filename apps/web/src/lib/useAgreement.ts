'use client';

import { useEffect, useState } from 'react';
import type { AgreementRecord } from '@fanout/database';

export function useAgreement(id: string) {
  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/agreements/${encodeURIComponent(id)}`)
      .then(async response => response.ok ? (await response.json()).data : null)
      .then(setAgreement)
      .catch(() => setAgreement(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { agreement, loading };
}
