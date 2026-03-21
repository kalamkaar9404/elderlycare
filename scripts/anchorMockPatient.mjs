// scripts/anchorMockPatient.mjs — Hardhat v3 with hardhat-ethers plugin
import { network } from 'hardhat';
import { createHash } from 'crypto';

// ── Mock patient (mirrors IntegrityShield canonical object) ──────────────────
const MOCK_PATIENT = {
  patientId:     'mock-patient-001',
  name:          'Priya Sharma',
  age:           28,
  pregnancyWeek: 24,
  riskLevel:     'medium',
  vitals: {
    bloodGlucose: 95,
    bloodPressure: '118/76',
    height:        162,
    hemoglobin:    10.5,
    weight:        62,
  },
  mealPlan: {
    focus:         'High Iron & Folate for second trimester',
    meals: [
      { calories: 380, name: 'Spinach Poha + Milk',    time: '8:00 AM'  },
      { calories: 200, name: 'Banana + Almonds',        time: '11:00 AM' },
      { calories: 520, name: 'Dal Rice + Sabzi + Curd', time: '1:00 PM'  },
      { calories: 210, name: 'Roasted Chana + Jaggery', time: '4:00 PM'  },
      { calories: 450, name: 'Khichdi + Ghee + Salad',  time: '7:00 PM'  },
    ],
    totalCalories: 2200,
  },
  prescription: null,
};

// ── Deterministic SHA-256 (mirrors hash-engine.ts sortedStringify) ───────────
function deepSortKeys(value) {
  if (Array.isArray(value)) return value.map(deepSortKeys);
  if (value !== null && typeof value === 'object') {
    const sorted = {};
    Object.keys(value).sort().forEach(k => { sorted[k] = deepSortKeys(value[k]); });
    return sorted;
  }
  return value;
}
function generateRecordHash(data) {
  return createHash('sha256').update(JSON.stringify(deepSortKeys(data))).digest('hex');
}

const INTEGRITY_ABI = [
  'function anchorRecord(string memory _id, string memory _hash) external',
  'function verifyRecord(string memory _id) external view returns (string memory fileHash, uint256 timestamp, address recorder, bool exists)',
];

async function main() {
  const contractAddress = process.env.INTEGRITY_CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error('ERROR: INTEGRITY_CONTRACT_ADDRESS not set in .env');
    console.error('   Run  npm run deploy  first, then add the address to .env');
    process.exit(1);
  }

  const { ethers } = await network.connect();
  const signers    = await ethers.getSigners();
  const signer     = signers[0];
  const patientId  = MOCK_PATIENT.patientId;
  const fileHash   = generateRecordHash(MOCK_PATIENT);

  console.log('\nAnchoring mock patient record ...');
  console.log('   Signer    :', signer.address);
  console.log('   Contract  :', contractAddress);
  console.log('   Patient ID:', patientId);
  console.log('   SHA-256   :', fileHash);
  console.log('\n   Sending transaction ...\n');

  const contract = await ethers.getContractAt(INTEGRITY_ABI, contractAddress);
  const tx       = await contract.anchorRecord(patientId, fileHash);
  const receipt  = await tx.wait(1);
  const txHash   = receipt.hash;

  console.log('SUCCESS: Record anchored on Polygon Amoy!');
  console.log('----------------------------------------------------------------------');
  console.log('   Patient          :', MOCK_PATIENT.name, '(ID:', patientId + ')');
  console.log('   SHA-256 Hash     :', fileHash);
  console.log('   Transaction Hash :', txHash);
  console.log('   PolygonScan      : https://amoy.polygonscan.com/tx/' + txHash);
  console.log('----------------------------------------------------------------------\n');

  // Verify on-chain immediately
  const onChain = await contract.verifyRecord(patientId);
  console.log('On-chain verification:');
  console.log('   Stored Hash  :', onChain.fileHash);
  console.log('   Match        :', onChain.fileHash === fileHash ? 'MATCH' : 'MISMATCH');
  console.log('   Recorded At  :', new Date(Number(onChain.timestamp) * 1000).toISOString());
  console.log('   Recorder     :', onChain.recorder);
  console.log('');
}

main().catch((err) => { console.error('Anchor failed:', err); process.exit(1); });
