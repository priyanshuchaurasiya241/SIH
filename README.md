# SIH 26047 - AI Clinical Intake & Ayush Case Taking System

## Local development

### Backend

```bash
cd server
npm install
node server.js
```

The backend runs on:
- http://localhost:5000

### Frontend

```bash
cd client
npm install
npm run dev -- --host 0.0.0.0
```

## Public deployment

This project is configured for deployment on Render.

1. Push the repository to GitHub.
2. Import the repo into Render.
3. Set the service root directory to `server`.
4. Use the build command:
   ```bash
   npm install
   ```
5. Use the start command:
   ```bash
   node server.js
   ```
6. Deploy.

The app will get a public URL automatically from Render.
