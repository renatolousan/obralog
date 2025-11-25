---
description: Start the development environment
---

1. Install backend dependencies
   cd backend
   npm install

2. Start backend services (database)
   cd backend
   docker compose up -d

3. Run database migrations and seed
   cd backend
   npx prisma migrate deploy
   npx prisma db seed

4. Install frontend dependencies
   cd frontend
   npm install

5. Start the application (Backend + Frontend)
   npm start
