import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { db, type BeneficiaryRecord } from '@fanout/database';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(value => value.trim());

app.disable('x-powered-by');
app.use((_req, res, next) => { res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('Referrer-Policy','no-referrer'); next(); });
app.use(cors({ origin: (origin, callback) => callback(null, !origin || origins.includes(origin)) }));
app.use(express.json({ limit: '32kb' }));

app.get('/health', async (_req, res, next) => {
  try { await db.health(); res.json({ status:'ok',service:'Fanout REST API',network:process.env.STELLAR_NETWORK || 'testnet',storage:db.mode,timestamp:new Date().toISOString() }); } catch(error){ next(error); }
});
app.get('/api/v1/agreements', async (_req,res,next)=>{try{res.json({success:true,data:await db.getAgreements()});}catch(error){next(error);}});
app.get('/api/v1/agreements/:id', async (req,res,next)=>{try{const agreement=await db.getAgreementById(req.params.id);if(!agreement)return res.status(404).json({success:false,error:'Agreement not found'});res.json({success:true,data:agreement});}catch(error){next(error);}});
app.post('/api/v1/agreements', async (req,res,next)=>{try{
  const {contractAddress,name,creatorAddress,acceptedAsset,beneficiaries,requiredApprovals}=req.body;
  if(!isAddress(contractAddress,'C')||!isAddress(creatorAddress,'G')||!isAddress(acceptedAsset,'C')||typeof name!=='string'||!name.trim()||!validBeneficiaries(beneficiaries)||!Number.isInteger(requiredApprovals)||requiredApprovals<1||requiredApprovals>beneficiaries.length)return res.status(400).json({success:false,error:'Invalid agreement parameters'});
  const agreement=await db.createAgreement({id:`agr_${randomUUID()}`,contractAddress,name:name.trim(),creatorAddress,acceptedAsset,status:'Active',version:1,requiredApprovals,totalDistributed:'0',transactionCount:0,beneficiaries,createdAt:new Date()});
  res.status(201).json({success:true,data:agreement});
}catch(error){next(error);}});
app.post('/api/v1/payments/requests',async(req,res,next)=>{try{const{agreementId,amount,payerAddress,reference}=req.body;const agreement=await db.getAgreementById(agreementId);if(!agreement)return res.status(404).json({success:false,error:'Agreement not found'});if(!/^\d+(\.\d{1,7})?$/.test(String(amount))||!isAddress(payerAddress,'G'))return res.status(400).json({success:false,error:'Invalid payment parameters'});const paymentRef=reference||`PAY_${Date.now()}`;res.json({success:true,data:{paymentRef,agreementId:agreement.id,amount,payerAddress,paymentUrl:`/pay/${agreement.id}?amount=${encodeURIComponent(amount)}&ref=${encodeURIComponent(paymentRef)}`}});}catch(error){next(error);}});
app.get('/api/v1/payments/history',async(req,res,next)=>{try{const id=typeof req.query.agreementId==='string'?req.query.agreementId:undefined;res.json({success:true,data:id?await db.getPaymentsForAgreement(id):await db.getRecentPayments()});}catch(error){next(error);}});
app.get('/api/v1/analytics/summary',async(_req,res,next)=>{try{const agreements=await db.getAgreements();res.json({success:true,data:{activeAgreements:agreements.filter(a=>a.status==='Active').length,totalDistributed:agreements.reduce((sum,a)=>sum+BigInt(a.totalDistributed),0n).toString(),totalTransactions:agreements.reduce((sum,a)=>sum+a.transactionCount,0),network:process.env.STELLAR_NETWORK||'testnet'}});}catch(error){next(error);}});

app.use((_req,res)=>res.status(404).json({success:false,error:'Not found'}));
app.use((error:unknown,_req:Request,res:Response,_next:NextFunction)=>{console.error('[api]',error);res.status(500).json({success:false,error:'Internal server error'});});

function isAddress(value:unknown,prefix:'C'|'G'):value is string{return typeof value==='string'&&value.startsWith(prefix)&&value.length===56&&/^[A-Z2-7]+$/.test(value);}
function validBeneficiaries(value:unknown):value is BeneficiaryRecord[]{if(!Array.isArray(value)||value.length===0||value.length>20)return false;const addresses=new Set<string>();let total=0;for(const item of value){if(!item||!isAddress(item.address,'G')||!Number.isInteger(item.allocationBps)||item.allocationBps<=0){return false;}addresses.add(item.address);total+=item.allocationBps;}return addresses.size===value.length&&total===10000;}

if(require.main===module)app.listen(PORT,()=>console.log(`Fanout API listening on ${PORT}`));
export default app;
