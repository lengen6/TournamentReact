import { create } from 'zustand'
import { Competitor } from '../models/Competitor'
import { Match } from '../models/Match'

type TournamentState = {
  competitors: Competitor[]
  matches: Match[]
  setCompetitors: (competitors: Competitor[]) => void
  setMatches: (matches: Match[]) => void
  resetTournament: () => void
}

export const useTournamentStore = create<TournamentState>((set) => ({
  competitors: [],
  matches: [],
  setCompetitors: (competitors) => set({ competitors }),
  setMatches: (matches) => set({ matches }),
  resetTournament: () => set({ competitors: [], matches: [] }),
}))
