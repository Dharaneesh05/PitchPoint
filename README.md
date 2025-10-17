    <h1>PitchPoint</h1>
    <p>PitchPoint is a comprehensive full-stack web application tailored for cricket fans, analysts, and coaches. It enables users to dive deep into cricket data, analyze player statistics, team performances, and leverage a lightweight machine learning integration for predicting player performance based on historical data. Whether you're a passionate fan tracking your favorite players, an analyst crunching numbers for insights, or a coach strategizing for upcoming matches, PitchPoint provides an intuitive platform to visualize, predict, and explore all aspects of cricket from one centralized website.</p>

    <h2>Features</h2>
    <ul>
        <li><strong>Player Performance Analysis</strong>: View detailed stats on batting, bowling, fielding, and overall performance for players across various formats (Test, ODI, T20).</li>
        <li><strong>ML-Powered Predictions</strong>: Integrated machine learning models (built with Jupyter notebooks) to forecast player performance, such as batting averages, bowling economy, or match outcomes based on past data.</li>
        <li><strong>Team and Match Insights</strong>: Analyze team compositions, head-to-head records, and match simulations.</li>
        <li><strong>Interactive Dashboards</strong>: User-friendly visualizations using charts and graphs for quick insights.</li>
        <li><strong>Data Management</strong>: Secure backend for storing and querying cricket data, with support for real-time updates.</li>
        <li><strong>User Roles</strong>: Customized views for fans (casual browsing), analysts (deep dives), and coaches (strategic tools).</li>
        <li><strong>Responsive Design</strong>: Accessible on desktop and mobile for on-the-go analysis.</li>
    </ul>

    <h2>Tech Stack</h2>
    <ul>
        <li><strong>Frontend</strong>: Built with React (or similar framework) for dynamic user interfaces, styled with Tailwind CSS.</li>
        <li><strong>Backend</strong>: Node.js/Express server handling API requests, authentication, and data processing.</li>
        <li><strong>Database</strong>: SQLite (cricket.db) for lightweight storage, with Drizzle ORM for queries.</li>
        <li><strong>ML Integration</strong>: Jupyter notebooks (e.g., Cricket_ctipynb.ipynb, Cricket_bowling.ipynb) for model training and prediction.</li>
        <li><strong>Build Tools</strong>: Vite for fast development, TypeScript for type safety.</li>
        <li><strong>Deployment</strong>: Configured for platforms like Render, Vercel, with environment variables for production.</li>
    </ul>

    <h2>Installation</h2>
    <p>To set up PitchPoint locally:</p>
    <ol>
        <li>Clone the repository:<br><pre>git clone https://github.com/Dharanes05/PitchPoint.git</pre></li>
        <li>Navigate to the project directory:<br><pre>cd PitchPoint</pre></li>
        <li>Install dependencies:<br><pre>npm install</pre></li>
        <li>Set up environment variables: Create a <code>.env</code> file based on <code>.env.example</code> (if available) and add necessary keys (e.g., database URL, API secrets).</li>
        <li>Run database migrations (if applicable):<br><pre>npm run migrate</pre></li>
        <li>Start the development server:<br><pre>npm run dev</pre><br>- Frontend will run on <code>http://localhost:3000</code> (or similar).<br>- Backend on <code>http://localhost:5000</code>.</li>
    </ol>
    <p>For production build:<br><pre>npm run build<br>npm run start</pre></p>

    <h2>Usage</h2>
    <ul>
        <li><strong>For Fans</strong>: Browse player profiles, view recent matches, and get quick predictions on upcoming games.</li>
        <li><strong>For Analysts</strong>: Upload custom datasets, run advanced queries, and export reports.</li>
        <li><strong>For Coaches</strong>: Simulate scenarios, predict player form, and build team strategies.</li>
        <li>Access the ML predictions via the dashboard—input player stats to get forecasts.</li>
        <li>Example: Navigate to <code>/analyze/player/:id</code> to view and predict performance for a specific player.</li>
    </ul>

    <h2>Screenshots</h2>
    <h3>Dashboard View</h3>
    <img src="screenshots/dashboard.png" alt="Dashboard Screenshot">
    <h3>Performance Prediction</h3>
    <img src="screenshots/prediction-page.jpg" alt="Prediction Screenshot">
