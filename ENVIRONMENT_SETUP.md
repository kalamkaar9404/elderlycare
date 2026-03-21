# Environment Setup for MedCare System

## Development Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=sepolia
NEXT_PUBLIC_ENVIRONMENT=development
```

### Backend (.env)
```env
ENVIRONMENT=development
DATABASE_URL=sqlite:///./medcare.db
BLOCKCHAIN_PROVIDER_URL=https://sepolia.infura.io/v3/demo
CONTRACT_ADDRESS=0x742d35Cc6346C7c5d72c9E9C80C0E
AI_MODEL_PATH=./models/
CORS_ORIGINS=http://localhost:3000
```

## Production Environment Variables (Vercel)

Set these in your Vercel dashboard:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=mainnet
DATABASE_URL=postgresql://user:pass@hostname:port/database
BLOCKCHAIN_PROVIDER_URL=https://mainnet.infura.io/v3/your-project-id
```

## Required API Keys

1. **Infura** (Blockchain): https://infura.io/
2. **OpenAI** (AI features): https://openai.com/api/
3. **Pinata** (IPFS storage): https://pinata.cloud/

## Local Development Setup

1. Copy environment files:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

2. Update with your API keys and URLs

3. Restart development servers