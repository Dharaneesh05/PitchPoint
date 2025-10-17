PitchPoint
PitchPoint is a comprehensive full-stack web application tailored for cricket fans, analysts, and coaches. It enables users to dive deep into cricket data, analyze player statistics, team performances, and leverage a lightweight machine learning integration for predicting player performance based on historical data. Whether you're a passionate fan tracking your favorite players, an analyst crunching numbers for insights, or a coach strategizing for upcoming matches, PitchPoint provides an intuitive platform to visualize, predict, and explore all aspects of cricket from one centralized website.
Features

Player Performance Analysis: View detailed stats on batting, bowling, fielding, and overall performance for players across various formats (Test, ODI, T20).
ML-Powered Predictions: Integrated machine learning models (built with Jupyter notebooks) to forecast player performance, such as batting averages, bowling economy, or match outcomes based on past data.
Team and Match Insights: Analyze team compositions, head-to-head records, and match simulations.
Interactive Dashboards: User-friendly visualizations using charts and graphs for quick insights.
Data Management: Secure backend for storing and querying cricket data, with support for real-time updates.
User Roles: Customized views for fans (casual browsing), analysts (deep dives), and coaches (strategic tools).
Responsive Design: Accessible on desktop and mobile for on-the-go analysis.

Tech Stack

Frontend: Built with React (or similar framework) for dynamic user interfaces, styled with Tailwind CSS.
Backend: Node.js/Express server handling API requests, authentication, and data processing.
Database: SQLite (cricket.db) for lightweight storage, with Drizzle ORM for queries.
ML Integration: Jupyter notebooks (e.g., Cricket_ctipynb.ipynb, Cricket_bowling.ipynb) for model training and prediction.
Build Tools: Vite for fast development, TypeScript for type safety.
Deployment: Configured for platforms like Render, Vercel, with environment variables for production.

Installation
To set up PitchPoint locally:

Clone the repository:git clone https://github.com/Dharanes05/PitchPoint.git


Navigate to the project directory:cd PitchPoint


Install dependencies:npm install


Set up environment variables: Create a .env file based on .env.example (if available) and add necessary keys (e.g., database URL, API secrets).
Run database migrations (if applicable):npm run migrate


Start the development server:npm run dev


Frontend will run on http://localhost:3000 (or similar).
Backend on http://localhost:5000.



For production build:
npm run build
npm run start

Usage

For Fans: Browse player profiles, view recent matches, and get quick predictions on upcoming games.
For Analysts: Upload custom datasets, run advanced queries, and export reports.
For Coaches: Simulate scenarios, predict player form, and build team strategies.
Access the ML predictions via the dashboard—input player stats to get forecasts.
Example: Navigate to /analyze/player/:id to view and predict performance for a specific player.

Screenshots
Dashboard View

Performance Prediction

Contributing
Contributions are welcome! Fork the repo, create a branch, and submit a pull request. Please follow the code style and add tests for new features.
License
This project is licensed under the MIT License.
MIT License

Copyright (c) 2025 Dharanes05

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
