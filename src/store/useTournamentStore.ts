import { create } from 'zustand'
import { Competitor } from '../models/Competitor'
import { Match } from '../models/Match'

export type DeleteCompetitorResult = 'deleted' | 'not_found' | 'has_history'

type TournamentState = {
  competitors: Competitor[]
  matches: Match[]
  elimination: number
  setCompetitors: (competitors: Competitor[]) => void
  setMatches: (matches: Match[]) => void
  setElimination: (elimination: number) => void
  addCompetitor: (payload: { firstName: string; lastName: string }) => Competitor
  updateCompetitor: (
    competitorId: number,
    payload: { firstName: string; lastName: string },
  ) => boolean
  deleteCompetitor: (competitorId: number) => DeleteCompetitorResult
  resetTournament: () => void
}

const toAllowedEliminationValue = (elimination: number): number =>
  elimination === 1 ? 1 : 2

const getNextCompetitorId = (competitors: Competitor[]): number =>
  competitors.length === 0
    ? 1
    : Math.max(...competitors.map((competitor) => competitor.competitorId)) + 1

export const useTournamentStore = create<TournamentState>((set, get) => ({
  competitors: [],
  matches: [],
  elimination: 2,
  setCompetitors: (competitors) => set({ competitors }),
  setMatches: (matches) => set({ matches }),
  setElimination: (elimination) =>
    set({ elimination: toAllowedEliminationValue(elimination) }),
  addCompetitor: ({ firstName, lastName }) => {
    const nextId = getNextCompetitorId(get().competitors)
    const competitor = new Competitor({
      competitorId: nextId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })

    set((state) => ({ competitors: [...state.competitors, competitor] }))
    return competitor
  },
  updateCompetitor: (competitorId, { firstName, lastName }) => {
    const competitors = get().competitors
    const competitorToUpdate = competitors.find(
      (competitor) => competitor.competitorId === competitorId,
    )

    if (!competitorToUpdate) {
      return false
    }

    const updatedCompetitor = new Competitor({
      ...competitorToUpdate,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })

    set({
      competitors: competitors.map((competitor) =>
        competitor.competitorId === competitorId ? updatedCompetitor : competitor,
      ),
    })

    return true
  },
  deleteCompetitor: (competitorId) => {
    const competitorToDelete = get().competitors.find(
      (competitor) => competitor.competitorId === competitorId,
    )

    if (!competitorToDelete) {
      return 'not_found'
    }

    if (
      competitorToDelete.wins !== 0 ||
      competitorToDelete.losses !== 0 ||
      competitorToDelete.byes !== 0
    ) {
      return 'has_history'
    }

    set((state) => ({
      competitors: state.competitors.filter(
        (competitor) => competitor.competitorId !== competitorId,
      ),
    }))

    return 'deleted'
  },
  resetTournament: () => set({ competitors: [], matches: [], elimination: 2 }),
}))
