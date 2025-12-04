 Text-to-Speech Full-Stack Web Application
A full-stack web application that converts text into natural speech, saves history and usage statistics, and uses modern technologies for both frontend and backend.

Technologies Used
Frontend:
HTML5
JavaScript (ES6, uses fetch)
Tailwind CSS (CDN)
Web Speech API (browser built-in for Text-to-Speech)

Backend:
Node.js
Express.js
MongoDB (local or Atlas)
Mongoose (ODM for MongoDB)
CORS (Express middleware)

Features:
Convert any text to natural-sounding speech using Web Speech API
Responsive and modern UI styled with Tailwind CSS
Customizable voice, pitch, speed, and volume controls
Save each speech record to MongoDB
View speech history in-app and in the database
See usage statistics (total records, character count, average length)
Dark mode support via Tailwind's dark: variants
Accessible forms and controls

Project Structure:

tts-fullstack-project/
├── backend/
│   ├── server.js
│   ├── config/
│   │    └── database.js
│   ├── controllers/
│   │    └── tts.controller.js
│   ├── models/
│   │    └── Speech.model.js
│   └── routes/
│       └── tts.routes.js
├── frontend/
│   ├── index.html
│   ├── app.js
├── .env
├── package.json
├── README.md


Setup Instructions:

1. Clone the Repository:
git clone https://github.com/sufian066/tts-fullstack-project.git
cd tts-fullstack-project

2. Install Dependencies:
npm install

3. Configure Environment (.env):
Create a .env file in project root:

PORT=3001
NODE_ENV=development
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/tts_database
FRONTEND_URL=http://127.0.0.1:5500
Change FRONTEND_URL to match the port you use for Live Server or static web server.

4. Start MongoDB:
Windows: net start MongoDB
macOS: brew services start mongodb-community
Linux: sudo systemctl start mongod
You can use MongoDB Compass for a GUI view.

5. Run Backend:
npm run dev
Backend server runs at http://localhost:3001

6. Run Frontend:
Open frontend/index.html in your browser using VS Code Live Server, python -m http.server, or similar.

7. Try It Out:
Enter text and click Speak & Save
Speech will play, history and statistics update
View stored records in MongoDB using Compass or mongosh

Statistics and History:
Recent speeches are shown on the UI
Statistics panel shows usage counts
All data is stored in the speeches collection, database: tts_database

API Endpoints:
POST /api/tts/save — Save new speech record
GET /api/tts/history — Retrieve recent history
GET /api/tts/statistics — App usage stats
DELETE /api/tts/:id — Delete speech record

Notes:
TTS is handled by browser's built-in Web Speech API (no external API required)
No authentication; all users are anonymous (userId: "anonymous" by default)
If you want to use a cloud TTS API (Google, Azure), or integrate Axios instead of fetch, see comments in code for easy upgrades

Contributing:
Open issues, fork and PRs welcome! For enhancements or bug fixes, please include test instructions.

License:
MIT License — Free to use, modify, and distribute.
