export interface LeaderboardEntry {
  id: string;
  nickname: string;
  gpuName: string;
  aiScore: number;
  tier: 1 | 2 | 3;
  timestamp: number;
  isCurrentUser?: boolean;
}

const MOCK_ENTRIES: LeaderboardEntry[] = [
  { id: 'm1', nickname: 'NeuralNinja', gpuName: 'NVIDIA GeForce RTX 4090', aiScore: 985, tier: 1, timestamp: Date.now() - 100000 },
  { id: 'm2', nickname: 'AI_Overlord', gpuName: 'NVIDIA H100 PCIe', aiScore: 998, tier: 1, timestamp: Date.now() - 500000 },
  { id: 'm3', nickname: 'SiliconDreamer', gpuName: 'AMD Radeon RX 7900 XTX', aiScore: 942, tier: 1, timestamp: Date.now() - 800000 },
  { id: 'm4', nickname: 'QuantumByte', gpuName: 'NVIDIA GeForce RTX 4080', aiScore: 915, tier: 1, timestamp: Date.now() - 1200000 },
  { id: 'm5', nickname: 'TechSavvy', gpuName: 'Apple M3 Max (40-core)', aiScore: 890, tier: 1, timestamp: Date.now() - 2000000 },
  { id: 'm6', nickname: 'CodeWeaver', gpuName: 'NVIDIA GeForce RTX 3090', aiScore: 855, tier: 1, timestamp: Date.now() - 3500000 },
  { id: 'm7', nickname: 'PixelPusher', gpuName: 'NVIDIA GeForce RTX 4070 Ti', aiScore: 820, tier: 2, timestamp: Date.now() - 4000000 },
  { id: 'm8', nickname: 'SynthMind', gpuName: 'AMD Radeon RX 6900 XT', aiScore: 785, tier: 2, timestamp: Date.now() - 5500000 },
  { id: 'm9', nickname: 'DataSorcerer', gpuName: 'Apple M2 Ultra (76-core)', aiScore: 765, tier: 2, timestamp: Date.now() - 6000000 },
  { id: 'm10', nickname: 'CyberPunk', gpuName: 'NVIDIA GeForce RTX 3080', aiScore: 740, tier: 2, timestamp: Date.now() - 7200000 },
  { id: 'm11', nickname: 'RenderGod', gpuName: 'NVIDIA GeForce RTX 4060 Ti', aiScore: 685, tier: 2, timestamp: Date.now() - 8000000 },
  { id: 'm12', nickname: 'ByteMe', gpuName: 'AMD Radeon RX 6700 XT', aiScore: 625, tier: 2, timestamp: Date.now() - 9500000 },
  { id: 'm13', nickname: 'MatrixWalker', gpuName: 'NVIDIA GeForce RTX 3060', aiScore: 550, tier: 3, timestamp: Date.now() - 11000000 },
  { id: 'm14', nickname: 'GPU_Gamer', gpuName: 'NVIDIA GeForce RTX 2080 Ti', aiScore: 535, tier: 3, timestamp: Date.now() - 12000000 },
  { id: 'm15', nickname: 'AppleFan', gpuName: 'Apple M1 Max (32-core)', aiScore: 505, tier: 3, timestamp: Date.now() - 13000000 },
];

export const getLeaderboard = (): LeaderboardEntry[] => {
  if (typeof window === 'undefined') return MOCK_ENTRIES;
  
  try {
    const localData = localStorage.getItem('llmfit_leaderboard');
    let localEntries: LeaderboardEntry[] = [];
    if (localData) {
      localEntries = JSON.parse(localData);
      
      // Clean up legacy scores that used the old 0-100 scale
      const validEntries = localEntries.filter(e => e.aiScore >= 100);
      if (validEntries.length !== localEntries.length) {
        localEntries = validEntries;
        localStorage.setItem('llmfit_leaderboard', JSON.stringify(localEntries));
      }
    }
    
    // Filter MOCK_ENTRIES to remove duplicates by nickname if localEntries have it
    const localNicknames = new Set(localEntries.map(e => (e.nickname || '').toLowerCase()));
    const filteredMocks = MOCK_ENTRIES.filter(m => !localNicknames.has((m.nickname || '').toLowerCase()));
    
    // Combine and sort by score descending
    const combined = [...filteredMocks, ...localEntries].sort((a, b) => b.aiScore - a.aiScore);
    return combined;
  } catch (e) {
    return MOCK_ENTRIES;
  }
};

export const submitToLeaderboard = (nickname: string, gpuName: string, aiScore: number, tier: 1 | 2 | 3): LeaderboardEntry => {
  const newEntry: LeaderboardEntry = {
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    nickname,
    gpuName,
    aiScore,
    tier,
    timestamp: Date.now(),
    isCurrentUser: true
  };

  if (typeof window !== 'undefined') {
    try {
      const localData = localStorage.getItem('llmfit_leaderboard');
      let localEntries: LeaderboardEntry[] = [];
      if (localData) {
        localEntries = JSON.parse(localData);
      }
      
      const existingIndex = localEntries.findIndex(e => (e.nickname || '').toLowerCase() === (nickname || '').toLowerCase());
      if (existingIndex !== -1) {
        localEntries[existingIndex] = newEntry;
      } else {
        localEntries.push(newEntry);
      }
      
      // Limit to max 20 local submissions so local storage doesn't blow up (increased from 5 to allow more experimentation)
      if (localEntries.length > 20) {
        localEntries = localEntries.slice(-20);
      }
      
      localStorage.setItem('llmfit_leaderboard', JSON.stringify(localEntries));
    } catch (e) {
      console.error('Failed to save score to local storage', e);
    }
  }

  return newEntry;
};
