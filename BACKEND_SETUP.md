# AMELIA Backend & Supabase Setup Guide

## Overview

Your application now has complete backend integration with:
- **FastAPI Backend**: Python medical AI with streaming responses
- **Supabase Database**: PostgreSQL with Row-Level Security
- **AI Models**: OpenAI GPT-4o-mini + Google Gemini Vision
- **Medical Knowledge**: ChromaDB vector database for clinical documents

## Backend Installation

### Step 1: Install Backend Dependencies

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Add your API keys to `backend/.env`:

```env
# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# Google Gemini (https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-key

# Supabase (from https://supabase.com project dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Step 3: Create Medical Knowledge Base (Optional)

Create directories for medical rules:

```bash
mkdir -p medical_kb
mkdir -p medical_rules
```

Medical rules files are already created at:
- `backend/medical_rules/symptom_triage_rules.json` - Symptom severity weights
- `backend/medical_rules/disease_probabilities.json` - Disease-symptom mappings
- `backend/medical_rules/drug_interactions.json` - Drug interaction warnings
- `backend/medical_rules/emergency_conditions.json` - Emergency protocols

Optional: Create `medical_kb/documents.txt` with clinical documents (one per line, separated by `---`)

### Step 4: Run Backend Server

```bash
# From backend directory
python main.py
```

Server will start at `http://localhost:8000`

API documentation available at `http://localhost:8000/docs`

## Supabase Database Setup

### Tables Created

1. **medical_memory** - Stores A.M.E.L.I.A's learned facts about patients
   - Automatic extraction from chat responses
   - Immutable historical record
   - Patient-specific context for clinical reasoning

2. **chat_history** - Stores all chat interactions
   - Session grouping for conversation continuity
   - Urgency classification
   - Optional image storage for vision analysis

### Enable in Frontend

Add to your `.env` (frontend):

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Or for production:

```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

## Frontend Integration

### Updated Hook: useAmeliaChat

The `hooks/useAmeliaChat.ts` hook now supports:

```typescript
const { messages, sendMessage, isLoading, clearChat } = useAmeliaChat(userId, userProfile);

// Send message with optional image
await sendMessage("I have a fever", base64ImageData);

// Load previous chat session
await loadMessages();

// Start new chat
clearChat();
```

### Usage Example

```typescript
'use client';

import { useAmeliaChat } from '@/hooks/useAmeliaChat';
import { useAuth } from '@/lib/auth';
import { usePatientProfile } from '@/hooks/usePatients';

export default function ChatPage() {
  const { user } = useAuth();
  const { profile } = usePatientProfile(user?.id);
  const { messages, sendMessage, isLoading } = useAmeliaChat(user?.id, profile);

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id} className={msg.role}>
          {msg.content}
        </div>
      ))}

      <textarea
        onSubmit={(e) => sendMessage(e.target.value)}
        disabled={isLoading}
      />
    </div>
  );
}
```

## API Endpoints

### POST /chat - Stream Medical Advice

**Request:**
```json
{
  "user_message": "I have chest pain and shortness of breath",
  "user_id": "user-uuid",
  "session_id": "session-uuid",
  "is_new_session": true,
  "profile": {
    "firstName": "John",
    "age": 45,
    "gender": "Male",
    "bloodType": "O+",
    "genotype": "AA",
    "weightKg": 80,
    "conditions": "Hypertension",
    "allergies": "Penicillin",
    "currentMeds": ["Lisinopril 10mg daily"]
  },
  "history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "image_data": "data:image/jpeg;base64,..." // Optional
}
```

**Response:** Server-Sent Events stream of AI response

### POST /api/generate-title - Generate Chat Title

**Request:**
```json
{
  "message": "I have severe chest pain"
}
```

**Response:**
```json
{
  "title": "Chest Pain Concern"
}
```

### GET / - Health Check

**Response:**
```json
{
  "status": "AMELIA Backend is Online",
  "version": "1.1.0",
  "environment": "local"
}
```

## AI Features

### Symptom Triage
Classifies urgency: EMERGENCY, URGENT, NON-URGENT
Calculates severity score (0-10)

### Emergency Detection
Hard-stops for life-threatening conditions:
- Chest pain with breathing difficulty
- Stroke signs (face drooping, arm weakness, slurred speech)
- Severe allergic reactions
- Severe bleeding

### Drug Safety Checking
- Cross-references medications with patient allergies
- Detects dangerous drug interactions
- Prevents potentially harmful recommendations

### Vision Analysis
- Parses lab results from images
- Extracts prescription details
- Identifies medical document types

### Medical Memory
- Extracts permanent patient facts from conversations
- Stores in Supabase medical_memory table
- Powers long-term clinical context
- Self-learning from each interaction

### Regional Medicine
- Recognizes endemic diseases (Malaria, Typhoid)
- Genotype-based reasoning (AS genotype heat sensitivity)
- Localized dietary analysis

## Troubleshooting

### Backend won't connect
```bash
# Check if server is running
curl http://localhost:8000/

# Check API docs
# Visit http://localhost:8000/docs
```

### Supabase memory not saving
- Verify SUPABASE_URL and SUPABASE_KEY in `.env`
- Check RLS policies on medical_memory table
- Ensure auth.users table has test user

### Vision features not working
- Verify GEMINI_API_KEY is set
- Test with clear, well-lit medical images
- Check image size (limit to 5MB)

### Medical rules not loading
- Verify JSON files in `backend/medical_rules/`
- Check JSON syntax validity
- Ensure files are in UTF-8 encoding

## Production Deployment

### Backend (Python)

**Using Docker:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Environment variables:**
```env
ENVIRONMENT=production
OPENAI_API_KEY=your-key
GEMINI_API_KEY=your-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key
CORS_ORIGINS=https://your-domain.com
```

### Frontend

Add backend URL to `.env`:
```env
REACT_APP_BACKEND_URL=https://api.your-domain.com
```

## Architecture

```
┌─────────────────────┐
│   Next.js Frontend  │
│  (React Components) │
└──────────┬──────────┘
           │ fetch /chat
           ▼
┌─────────────────────┐
│  FastAPI Backend    │
│  (Python)           │
├─────────────────────┤
│ OpenAI (GPT-4o-mini)│
│ Google Gemini Vision│
│ ChromaDB (Medical KB)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Supabase         │
│  (PostgreSQL)       │
├─────────────────────┤
│ medical_memory      │
│ chat_history        │
│ auth.users          │
└─────────────────────┘
```

## Security Notes

- Patient data stored with Row-Level Security (RLS)
- Medical memories are user-specific and immutable
- API keys never exposed to frontend
- Image data encrypted in transit
- CORS restricted to trusted domains

## Support

For issues:
1. Check backend logs: `python main.py --debug`
2. Verify all environment variables
3. Test API directly: `curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{...}'`
4. Review error responses for specific issues
