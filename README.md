# 🌊 FloatChat

FloatChat is an advanced, real-time oceanographic visualization platform and command center. It integrates real-world ocean telemetry data, providing interactive geographic exploration and deep-sea analytics directly in the browser. 

Through seamless integration with **Argovis** and **Open-Meteo**, FloatChat visualizes thousands of oceanic floats, historical trajectories, and dynamic ocean currents over an interactive 3D globe.

![FloatChat](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Key Features

- 🌍 **3D Globe Visualization**: Powered by `deck.gl`, featuring a beautifully rendered colored globe with customizable viewport navigation and longitude normalization.
- 📡 **Real-Time Argovis Integration**: Fetches live and historical ocean observations directly from the Argovis API, protected by a server-side Express proxy.
- 🌊 **Ocean Currents**: Live ocean current visualization powered by the Open-Meteo integration.
- ✏️ **Draw & Discover**: Use geographical polygon drawing on the globe to seamlessly query, filter, and extract localized observations.
- 📊 **Deep-Sea Analytics**: Advanced analytical modules including context-aware **T-S (Temperature-Salinity) diagrams**, thermocline plotting, and live viewport aggregation data.
- 🎛️ **Glassmorphism Command Center**: A sleek, non-blocking UI featuring an Executive Ocean State dashboard, a bottom historical timeline, and an interactive right telemetry dock.
- ⚡ **Optimized Performance**: Features viewport-based debounce loading, stale-request protection, and local caching to handle massive geographic datasets without stuttering.

## 🛠️ Tech Stack

- **Frontend**: React (v18), Vite, TypeScript, React-Map-GL
- **Visualization**: Deck.gl & Maplibre-GL (Geo-Layers, Core 3D engine)
- **Charts**: Recharts for dynamic telemetry and T-S scatter plotting
- **Backend / Proxy**: Express (Node.js), CORS, node-fetch
- **Styling**: Context-aware custom CSS styling (Glassmorphism aesthetics)

## 🚀 Getting Started

Follow these steps to run the FloatChat command center locally.

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- Git

### 2. Installation
Clone the repository and install the dependencies for both the frontend and backend:

```bash
npm install
```

### 3. Environment Variables
You need an Argovis API key for real float data. Create a `.env.local` file in the root of the project:

```env
# .env.local
ARGOVIS_API_KEY=your_api_key_here
PORT=3001
```

*(Note: Never commit your `.env` or `.env.local` file to version control).*

### 4. Running the Application
Start both the React frontend and the Express backend proxy concurrently with one command:

```bash
npm run dev
```

- **Frontend**: Available at `http://localhost:5173`
- **Backend API**: Available at `http://localhost:3001`

### 5. Building for Production
To bundle the frontend for production:

```bash
npm run build
```
This will compile TypeScript and output the optimized build to the `dist/` directory.

## 📁 Project Architecture

- `/src/` - React frontend application.
  - `/components/` - UI components including Maps, `CommandDocks`, and charts.
  - `/data/` - Data providers, models, and hooks (`ArgovisProvider.ts`, etc.).
- `/server/` - Express backend used for securely proxying requests to Argovis to protect API credentials.

## 📝 License
This project is licensed under the MIT License.
