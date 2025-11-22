import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Activity, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Menu, 
  X,
  Search,
  Share2,
  Star,
  TrendingUp,
  Monitor,
  Settings,
  Plus,
  Save
} from 'lucide-react';

// --- Mock Data Generator for Large Bracket (48-64 Teams) ---
const generateBracketData = () => {
  const rounds = [64, 32, 16, 8, 4, 2];
  const bracket = [];

  rounds.forEach((count, roundIndex) => {
    const matches = [];
    const matchCount = count / 2;
    
    for (let i = 0; i < matchCount; i++) {
      // Simulate some results
      const isPlayed = roundIndex < 2; // First 2 rounds played
      const score1 = isPlayed ? Math.floor(Math.random() * 7) : '-';
      const score2 = isPlayed ? Math.floor(Math.random() * 7) : '-';
      
      matches.push({
        id: `r${roundIndex}-m${i}`,
        roundIndex,
        matchIndex: i,
        team1: roundIndex === 0 ? `Team ${i * 2 + 1}` : (isPlayed ? `Winner ${i*2+1}` : 'TBD'),
        team2: roundIndex === 0 ? `Team ${i * 2 + 2}` : (isPlayed ? `Winner ${i*2+2}` : 'TBD'),
        score1,
        score2,
        winner: isPlayed ? (score1 > score2 ? 1 : 2) : null,
        status: isPlayed ? 'FINISHED' : 'SCHEDULED'
      });
    }
    bracket.push(matches);
  });
  return bracket;
};

const LARGE_BRACKET = generateBracketData();

const SPONSORS = [
  { name: "NOX", tier: "Gold" },
  { name: "BULLPADEL", tier: "Gold" },
  { name: "ADIDAS", tier: "Silver" },
  { name: "HEAD", tier: "Silver" },
  { name: "WILSON", tier: "Bronze" },
  { name: "BABOLAT", tier: "Bronze" }
];

const LIVE_MATCH = {
  court: "Center Court",
  phase: "Quarter Finals",
  team1: { names: "Lebrón / Galán", set1: "6", set2: "4", current: "4" },
  team2: { names: "Coello / Tapia", set1: "4", set2: "6", current: "5" },
  server: 1 // Team 1 serving
};

// --- Components ---

const ModeToggle = ({ mode, setMode }) => (
  <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-white border border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <button 
      onClick={() => setMode('TV')}
      className={`px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
        mode === 'TV' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
      }`}
    >
      <Monitor size={16} /> TV View
    </button>
    <button 
      onClick={() => setMode('ADMIN')}
      className={`px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
        mode === 'ADMIN' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
      }`}
    >
      <Settings size={16} /> Admin
    </button>
  </div>
);

// --- Bracket Engine (SVG) ---
const BracketView = () => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  // Dimensions constants
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 80;
  const GAP_X = 100;
  const GAP_Y = 20;

  // Calculate dynamic height for the container based on Round 1 matches
  const totalHeight = (LARGE_BRACKET[0].length * (CARD_HEIGHT + GAP_Y)) * 1.5;

  const renderConnectingLines = (roundIndex, matchIndex, totalMatchesInRound) => {
    if (roundIndex === LARGE_BRACKET.length - 1) return null;

    // Calculate coordinates
    // Position logic: Center the next round match vertically between the two feeding matches
    // Simple tree logic for visualization
    
    // This is a simplified visual connector. In a real app, we'd calculate exact Y based on the recursive tree height.
    // For this demo, we will just draw a line to the right.
    
    return (
      <svg className="absolute overflow-visible pointer-events-none z-0" style={{ left: CARD_WIDTH, top: CARD_HEIGHT / 2 }}>
        <path 
          d={`M 0 0 C ${GAP_X/2} 0, ${GAP_X/2} 0, ${GAP_X} 0`} 
          fill="none" 
          stroke="black" 
          strokeWidth="2" 
        />
      </svg>
    );
  };

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 relative p-12 cursor-grab active:cursor-grabbing">
      <div className="absolute top-6 left-12 z-10">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Official Draw</h2>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Round of 64 • Main Draw</p>
      </div>

      <div className="flex gap-[100px] pt-24" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {LARGE_BRACKET.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around space-y-4 relative">
             {/* Round Header */}
             <div className="absolute -top-16 left-0 w-full text-center font-black uppercase tracking-widest text-sm border-b-2 border-black pb-2">
                {roundIndex === 5 ? 'FINAL' : roundIndex === 4 ? 'SEMI FINAL' : roundIndex === 3 ? 'QUARTER FINAL' : `Round ${roundIndex + 1}`}
             </div>

             {round.map((match, matchIndex) => (
               <div 
                key={match.id} 
                className="relative bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center p-2 transition-transform hover:-translate-y-1"
                style={{ 
                  width: CARD_WIDTH, 
                  height: CARD_HEIGHT,
                  // Add extra margin to vertically center matches in later rounds
                  marginTop: roundIndex > 0 ? `${(Math.pow(2, roundIndex) - 1) * (CARD_HEIGHT/2 + GAP_Y/2)}px` : '0',
                  marginBottom: roundIndex > 0 ? `${(Math.pow(2, roundIndex) - 1) * (CARD_HEIGHT/2 + GAP_Y/2)}px` : '0',
                }}
               >
                 {/* Match Content */}
                 <div className={`flex justify-between items-center border-b border-gray-200 pb-1 mb-1 ${match.winner === 1 ? 'font-black' : 'text-gray-500 font-medium'}`}>
                   <span className="truncate text-xs uppercase w-32">{match.team1}</span>
                   <span className="font-mono text-sm">{match.score1}</span>
                 </div>
                 <div className={`flex justify-between items-center ${match.winner === 2 ? 'font-black' : 'text-gray-500 font-medium'}`}>
                   <span className="truncate text-xs uppercase w-32">{match.team2}</span>
                   <span className="font-mono text-sm">{match.score2}</span>
                 </div>
                 
                 {/* SVG Connector Line Logic (Simplified for Visual) */}
                 {/* In a real tree, we'd draw paths to the parent. Here we just imply direction right */}
                 {roundIndex < LARGE_BRACKET.length - 1 && (
                    <div className="absolute top-1/2 -right-[102px] w-[100px] h-[2px] bg-black z-[-1] origin-left scale-x-105" />
                 )}
               </div>
             ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TV Display Views ---

const TVLiveScoreboard = () => (
  <div className="h-full flex flex-col bg-white">
    {/* Header */}
    <div className="h-24 bg-black text-white flex justify-between items-center px-12">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-white rotate-45 flex items-center justify-center">
             <div className="h-4 w-4 bg-black"></div>
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Padel Pro Major</h1>
          <span className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">Official Tournament Display</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
         <span className="animate-pulse h-3 w-3 bg-red-600 rounded-full"></span>
         <span className="text-xl font-black uppercase tracking-widest">Live on Court</span>
      </div>
    </div>

    {/* Main Score Area */}
    <div className="flex-1 flex items-center justify-center p-12 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="w-full max-w-6xl bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8">
        <div className="text-center mb-8">
          <span className="bg-black text-white px-4 py-1 text-sm font-bold uppercase tracking-widest">Quarter Finals • Center Court</span>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Team 1 */}
          <div className="flex-1 text-center">
             <h2 className="text-5xl font-black uppercase italic mb-2">{LIVE_MATCH.team1.names}</h2>
             <div className="flex justify-center gap-2 mt-4">
               <div className="w-4 h-4 rounded-full bg-black"></div> {/* Serving Indicator */}
             </div>
          </div>

          {/* Scores */}
          <div className="flex gap-4 mx-12">
             {/* Set 1 */}
             <div className="flex flex-col items-center">
                <div className="text-xs font-bold uppercase text-gray-400 mb-2">Set 1</div>
                <div className="w-20 h-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-4xl font-mono font-bold text-gray-400">
                  {LIVE_MATCH.team1.set1}
                </div>
                <div className="w-20 h-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-4xl font-mono font-bold text-gray-400 mt-2">
                  {LIVE_MATCH.team2.set1}
                </div>
             </div>
             {/* Set 2 */}
             <div className="flex flex-col items-center">
                <div className="text-xs font-bold uppercase text-gray-400 mb-2">Set 2</div>
                <div className="w-20 h-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-4xl font-mono font-bold text-gray-400">
                  {LIVE_MATCH.team1.set2}
                </div>
                <div className="w-20 h-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-4xl font-mono font-bold text-gray-400 mt-2">
                  {LIVE_MATCH.team2.set2}
                </div>
             </div>
             {/* Current Set (Big) */}
             <div className="flex flex-col items-center">
                <div className="text-xs font-bold uppercase text-red-600 mb-2 animate-pulse">Live Set</div>
                <div className="w-32 h-24 bg-black text-white flex items-center justify-center text-6xl font-mono font-black border-2 border-black">
                  {LIVE_MATCH.team1.current}
                </div>
                <div className="w-32 h-24 bg-white text-black flex items-center justify-center text-6xl font-mono font-black border-2 border-black mt-2">
                  {LIVE_MATCH.team2.current}
                </div>
             </div>
             {/* Points (Tennis scoring) */}
             <div className="flex flex-col items-center ml-4">
                 <div className="text-xs font-bold uppercase text-gray-400 mb-2">Points</div>
                 <div className="h-24 flex items-center text-4xl font-mono text-gray-300">40</div>
                 <div className="h-24 flex items-center text-4xl font-mono text-gray-300 mt-2">30</div>
             </div>
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-center">
             <h2 className="text-5xl font-black uppercase italic mb-2 text-gray-400">{LIVE_MATCH.team2.names}</h2>
          </div>
        </div>
      </div>
    </div>

    {/* Ticker Footer */}
    <div className="h-16 bg-white border-t-4 border-black flex items-center overflow-hidden relative">
      <div className="absolute left-0 h-full bg-black text-white px-6 flex items-center z-10 font-black uppercase italic tracking-widest text-xl">
        Sponsors
      </div>
      <div className="animate-marquee flex items-center whitespace-nowrap">
         {/* Duplicated for seamless loop */}
         {[...SPONSORS, ...SPONSORS, ...SPONSORS].map((s, i) => (
           <div key={i} className="flex items-center mx-8">
              <Star size={12} className="mr-2 text-black" fill="black" />
              <span className="text-xl font-bold uppercase tracking-widest">{s.name}</span>
           </div>
         ))}
      </div>
    </div>
  </div>
);

// --- Admin Views ---

const AdminDashboard = () => (
  <div className="p-8 max-w-5xl mx-auto">
    <div className="flex justify-between items-end mb-12 border-b-4 border-black pb-6">
      <div>
        <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Tournament Desk</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest">Control Panel • Madrid Premier Major</p>
      </div>
      <div className="flex gap-4">
        <div className="text-right">
          <div className="text-xs font-bold uppercase text-gray-400">Logged in as</div>
          <div className="font-bold">Director Ref</div>
        </div>
        <div className="h-10 w-10 bg-black rounded-full"></div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-8">
      {/* Quick Actions */}
      <div className="col-span-1 space-y-6">
        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
           <h3 className="font-black uppercase text-xl mb-2 flex items-center gap-2"><Plus size={24}/> New Team Reg</h3>
           <p className="text-sm text-gray-500">Register a new duo for the tournament.</p>
        </div>
        
        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
           <h3 className="font-black uppercase text-xl mb-2 flex items-center gap-2"><Activity size={24}/> Update Scores</h3>
           <p className="text-sm text-gray-500">Modify live match score for TV display.</p>
        </div>

        <div className="bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(200,200,200,1)]">
           <h3 className="font-black uppercase text-xl mb-4">System Status</h3>
           <div className="flex justify-between text-sm mb-2">
             <span className="text-gray-400">TV Displays</span>
             <span className="text-green-400 font-bold">ONLINE (3)</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-gray-400">Sync</span>
             <span className="text-green-400 font-bold">ACTIVE</span>
           </div>
        </div>
      </div>

      {/* Registration Form Preview */}
      <div className="col-span-2 bg-gray-50 border-2 border-black p-8">
        <h3 className="font-black uppercase text-2xl mb-6 border-b border-gray-300 pb-4">Quick Registration</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Player 1 Name</label>
              <input type="text" className="w-full border-2 border-black p-3 font-bold uppercase focus:outline-none focus:ring-4 ring-gray-200" placeholder="SURNAME" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Ranking Points</label>
              <input type="number" className="w-full border-2 border-black p-3 font-mono focus:outline-none" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Player 2 Name</label>
              <input type="text" className="w-full border-2 border-black p-3 font-bold uppercase focus:outline-none focus:ring-4 ring-gray-200" placeholder="SURNAME" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Seed #</label>
              <input type="number" className="w-full border-2 border-black p-3 font-mono focus:outline-none" placeholder="Auto" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="button" className="bg-black text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2">
              <Save size={18} /> Register Team
            </button>
          </div>
        </form>
      </div>
    </div>
    
    {/* Recent Logs */}
    <div className="mt-12">
      <h3 className="font-bold uppercase tracking-widest text-sm mb-4 text-gray-500">Recent Activity</h3>
      <div className="border border-gray-200">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
             <span className="font-mono text-xs text-gray-400">10:4{i} AM</span>
             <span className="font-bold uppercase text-sm">Score Update: Center Court (Set 2)</span>
             <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 font-bold uppercase rounded">Admin 1</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [mode, setMode] = useState('TV'); // 'TV', 'BRACKET', 'ADMIN'
  const [tvView, setTvView] = useState('SCOREBOARD'); // 'SCOREBOARD', 'BRACKET'
  
  // Auto-rotate TV view for demo purposes
  useEffect(() => {
    if (mode === 'TV') {
      const interval = setInterval(() => {
        setTvView(current => current === 'SCOREBOARD' ? 'BRACKET' : 'SCOREBOARD');
      }, 10000); // Rotate every 10 seconds
      return () => clearInterval(interval);
    }
  }, [mode]);

  return (
    <div className="h-screen w-screen bg-white text-black overflow-hidden font-sans">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        /* Hide scrollbar for TV aesthetic but allow scroll */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Mode Switcher (Always visible for demo) */}
      <ModeToggle mode={mode} setMode={setMode} />

      {/* Views */}
      {mode === 'ADMIN' ? (
        <div className="h-full overflow-y-auto bg-gray-50">
          <AdminDashboard />
        </div>
      ) : (
        <div className="h-full">
           {tvView === 'SCOREBOARD' && <TVLiveScoreboard />}
           {tvView === 'BRACKET' && <BracketView />}
        </div>
      )}
    </div>
  );
}