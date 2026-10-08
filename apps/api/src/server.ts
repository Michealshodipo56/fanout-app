import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from '@fanout/database';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Fanout REST API', network: 'testnet', timestamp: new Date() });
});

// Agreements API
app.get('/api/v1/agreements', (_req: Request, res: Response) => {
  const agreements = db.getAgreements();
  res.json({ success: true, data: agreements });
});

app.get('/api/v1/agreements/:id', (req: Request, res: Response) => {
  const agr = db.getAgreementById(req.params.id);
  if (!agr) {
    return res.status(404).json({ success: false, error: 'Agreement not found' });
  }
  res.json({ success: true, data: agr });
});

app.post('/api/v1/agreements', (req: Request, res: Response) => {
  const { contractAddress, name, creatorAddress, acceptedAsset, beneficiaries, requiredApprovals } = req.body;
  
  if (!contractAddress || !name || !creatorAddress || !acceptedAsset || !Array.isArray(beneficiaries) || beneficiaries.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid parameters' });
  }

  const newAgr = db.createAgreement({
    id: `agr_${Date.now()}`,
    contractAddress,
    name,
    creatorAddress,
    acceptedAsset,
    status: 'Active',
    version: 1,
    requiredApprovals: requiredApprovals || beneficiaries.length,
    totalDistributed: '0',
    transactionCount: 0,
    beneficiaries,
    createdAt: new Date()
  });

  res.status(201).json({ success: true, data: newAgr });
});

// Payments API
app.post('/api/v1/payments/requests', (req: Request, res: Response) => {
  const { agreementId, amount, payerAddress, reference } = req.body;
  const agr = db.getAgreementById(agreementId);
  if (!agr) {
    return res.status(404).json({ success: false, error: 'Agreement not found' });
  }

  const paymentRef = reference || `PAY_${Date.now()}`;
  const paymentUrl = `/pay/${agr.id}?amount=${amount}&ref=${paymentRef}`;

  res.json({
    success: true,
    data: {
      paymentRef,
      agreementId: agr.id,
      amount,
      payerAddress,
      paymentUrl
    }
  });
});

app.get('/api/v1/payments/history', (req: Request, res: Response) => {
  const { agreementId } = req.query;
  if (typeof agreementId === 'string') {
    const history = db.getPaymentsForAgreement(agreementId);
    return res.json({ success: true, data: history });
  }
  res.json({ success: true, data: db.getRecentPayments() });
});

// Analytics Endpoint
app.get('/api/v1/analytics/summary', (_req: Request, res: Response) => {
  const agreements = db.getAgreements();
  let totalDistributed = BigInt(0);
  let totalTransactions = 0;

  for (const a of agreements) {
    totalDistributed += BigInt(a.totalDistributed);
    totalTransactions += a.transactionCount;
  }

  res.json({
    success: true,
    data: {
      activeAgreements: agreements.filter(a => a.status === 'Active').length,
      totalDistributed: totalDistributed.toString(),
      totalTransactions,
      network: 'testnet'
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Fanout API Server running on port ${PORT}`);
  });
}

export default app;
