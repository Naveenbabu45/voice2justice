#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Police Complaint Portal — Setup Script
# ─────────────────────────────────────────────────────────────────
set -e

echo "🛡️  Setting up Police Complaint Portal..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 2. Create .env.local from .env.example if not exists
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ Created .env.local — please add your ANTHROPIC_API_KEY"
else
  echo "ℹ️  .env.local already exists"
fi

# 3. Create data directory
mkdir -p data

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Edit .env.local and add: ANTHROPIC_API_KEY=your_key_here"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "🔑 Admin login: admin / Admin@2024"
echo ""
