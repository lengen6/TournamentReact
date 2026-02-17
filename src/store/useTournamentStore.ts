import { create } from 'zustand'
import { Competitor } from '../models/Competitor'
import { Match } from '../models/Match'

export type DeleteCompetitorResult = 'deleted' | 'not_found' | 'has_history'

export type ActiveMatch = {
  redCompetitorId: number
  blueCompetitorId: number
  round: number
  matchNumber: number
}

export type AdvanceEventResult =
  | { status: 'match_ready'; activeMatch: ActiveMatch }
  | { status: 'results' }
  | { status: 'competitor_count_error' }
  | { status: 'idle' }

type CompleteMatchPayload = {
  redWins: boolean
  redScore: number
  blueScore: number
  victoryMethod: string
  startMinutes: number
  startSeconds: number
  endMinutes: number
  endSeconds: number
}

type TournamentState = {
  competitors: Competitor[]
  matches: Match[]
  elimination: number
  currentRound: number
  currentMatchNumber: number
  activeMatch: ActiveMatch | null
  setCompetitors: (competitors: Competitor[]) => void
  setMatches: (matches: Match[]) => void
  setElimination: (elimination: number) => void
  beginEvent: (elimination: number) => void
  advanceEvent: () => AdvanceEventResult
  completeActiveMatch: (payload: CompleteMatchPayload) => Match | null
  resetCompetitorsForNextEvent: () => void
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

const getNextMatchId = (matches: Match[]): number =>
  matches.length === 0 ? 1 : Math.max(...matches.map((match) => match.matchId)) + 1

const cloneCompetitors = (competitors: Competitor[]): Competitor[] =>
  competitors.map((competitor) => new Competitor(competitor))

const cloneMatches = (matches: Match[]): Match[] =>
  matches.map((match) => new Match(match))

const pickPlayer = (bracket: Competitor[]): Competitor => {
  const competitorIndex = Math.floor(Math.random() * bracket.length)
  const competitor = bracket[competitorIndex]
  bracket.splice(competitorIndex, 1)
  return competitor
}

const determineByes = (bracket: Competitor[]) => {
  const wasPreviouslyRun = bracket.some((competitor) => competitor.previousParticipant)
  if (wasPreviouslyRun || bracket.length % 2 === 0 || bracket.length === 0) {
    return
  }

  const competitorIndex = Math.floor(Math.random() * bracket.length)
  const byeCompetitor = bracket[competitorIndex]
  byeCompetitor.byes += 1
  byeCompetitor.bracket = 'Bye'
  byeCompetitor.previousParticipant = true
}

const isBracketFinished = (bracket: Competitor[]): boolean =>
  bracket.every((competitor) => competitor.previousParticipant)

const isRoundOver = (winners: Competitor[], losers: Competitor[]): boolean => {
  for (const competitor of winners) {
    if (!competitor.previousParticipant) {
      return false
    }
  }

  for (const competitor of losers) {
    if (!competitor.previousParticipant) {
      return false
    }
  }

  return true
}

const resetParticipants = (competitors: Competitor[]) => {
  for (const competitor of competitors) {
    competitor.previousParticipant = false
  }
}

type ArrangeMatchResult =
  | { status: 'matched'; redCompetitor: Competitor; blueCompetitor: Competitor }
  | { status: 'none' }

const arrangeMatch = (bracket: Competitor[]): ArrangeMatchResult => {
  const viableCompetitors = bracket.filter((competitor) => !competitor.previousParticipant)
  if (viableCompetitors.length > 1) {
    const redCompetitor = pickPlayer(viableCompetitors)
    const blueCompetitor = pickPlayer(viableCompetitors)
    return { status: 'matched', redCompetitor, blueCompetitor }
  }

  if (viableCompetitors.length === 1) {
    viableCompetitors[0].byes += 1
    viableCompetitors[0].bracket = 'Bye'
    viableCompetitors[0].previousParticipant = true
  }

  return { status: 'none' }
}

const formatTwoDigits = (value: number): string =>
  value < 10 ? `0${value}` : `${value}`

const toTimeString = (minutes: number, seconds: number): string =>
  `${formatTwoDigits(Math.max(0, minutes))}:${formatTwoDigits(Math.max(0, seconds))}`

const toTimeInSeconds = (timeValue: string): number => {
  const [minutesValue, secondsValue] = timeValue.split(':')
  return Number(minutesValue) * 60 + Number(secondsValue)
}

const toDuration = (startTime: string, endTime: string): string => {
  const difference = Math.abs(toTimeInSeconds(endTime) - toTimeInSeconds(startTime))
  const minutes = Math.floor(difference / 60)
  const seconds = difference % 60
  return toTimeString(minutes, seconds)
}

const setPairingFlags = (
  competitors: Competitor[],
  redCompetitor: Competitor,
  blueCompetitor: Competitor,
) => {
  for (const competitor of competitors) {
    competitor.isRedComp = false
    competitor.isBlueComp = false
  }

  redCompetitor.isRedComp = true
  blueCompetitor.isBlueComp = true
  redCompetitor.previousParticipant = true
  blueCompetitor.previousParticipant = true
  redCompetitor.lastMatch = true
  blueCompetitor.lastMatch = true
}

const buildMatchReadyResult = (activeMatch: ActiveMatch): AdvanceEventResult => ({
  status: 'match_ready',
  activeMatch,
})

export const useTournamentStore = create<TournamentState>((set, get) => ({
  competitors: [],
  matches: [],
  elimination: 2,
  currentRound: 0,
  currentMatchNumber: 0,
  activeMatch: null,
  setCompetitors: (competitors) => set({ competitors }),
  setMatches: (matches) => set({ matches }),
  setElimination: (elimination) =>
    set({ elimination: toAllowedEliminationValue(elimination) }),
  beginEvent: (elimination) =>
    set((state) => ({
      competitors: cloneCompetitors(state.competitors).map(
        (competitor) =>
          new Competitor({
            ...competitor,
            isRedComp: false,
            isBlueComp: false,
            previousParticipant: false,
            lastMatch: false,
          }),
      ),
      elimination: toAllowedEliminationValue(elimination),
      currentRound: 0,
      currentMatchNumber: 0,
      activeMatch: null,
    })),
  advanceEvent: () => {
    let advanceResult: AdvanceEventResult = { status: 'idle' }

    set((state) => {
      const competitors = cloneCompetitors(state.competitors)
      let round = state.currentRound
      let matchNumber = state.currentMatchNumber

      const buildActiveMatch = (
        redCompetitor: Competitor,
        blueCompetitor: Competitor,
      ): ActiveMatch => {
        if (round === 0) {
          round = 1
        }

        matchNumber += 1
        setPairingFlags(competitors, redCompetitor, blueCompetitor)
        return {
          redCompetitorId: redCompetitor.competitorId,
          blueCompetitorId: blueCompetitor.competitorId,
          round,
          matchNumber,
        }
      }

      if (state.activeMatch) {
        const redCompetitorExists = competitors.some(
          (competitor) => competitor.competitorId === state.activeMatch?.redCompetitorId,
        )
        const blueCompetitorExists = competitors.some(
          (competitor) => competitor.competitorId === state.activeMatch?.blueCompetitorId,
        )

        if (redCompetitorExists && blueCompetitorExists) {
          advanceResult = buildMatchReadyResult(state.activeMatch)
          return state
        }
      }

      if (competitors.length < 2) {
        advanceResult = { status: 'competitor_count_error' }
        return { ...state, activeMatch: null }
      }

      for (let iteration = 0; iteration < 50; iteration += 1) {
        const winners = competitors.filter((competitor) => competitor.bracket === 'Winner')
        const losers = competitors.filter((competitor) => competitor.bracket === 'Loser')
        const eliminated = competitors.filter(
          (competitor) => competitor.bracket === 'Eliminated',
        )

        if (eliminated.length === competitors.length - 1 && winners.length > 0) {
          winners[0].place = 1
          const orderedByWins = [...eliminated].sort((left, right) => right.wins - left.wins)
          for (let index = 0; index < orderedByWins.length; index += 1) {
            orderedByWins[index].place = index + 2
          }

          advanceResult = { status: 'results' }
          return {
            ...state,
            competitors,
            currentRound: round,
            currentMatchNumber: matchNumber,
            activeMatch: null,
          }
        }

        if (winners.length === 1 && losers.length === 1) {
          const activeMatch = buildActiveMatch(winners[0], losers[0])
          advanceResult = buildMatchReadyResult(activeMatch)
          return {
            ...state,
            competitors,
            currentRound: round,
            currentMatchNumber: matchNumber,
            activeMatch,
          }
        }

        if (winners.length > 0) {
          determineByes(winners)
          if (!isBracketFinished(winners)) {
            const winnersMatch = arrangeMatch(winners)
            if (winnersMatch.status === 'matched') {
              const activeMatch = buildActiveMatch(
                winnersMatch.redCompetitor,
                winnersMatch.blueCompetitor,
              )
              advanceResult = buildMatchReadyResult(activeMatch)
              return {
                ...state,
                competitors,
                currentRound: round,
                currentMatchNumber: matchNumber,
                activeMatch,
              }
            }
          }
        }

        if (losers.length > 0) {
          determineByes(losers)
          if (!isBracketFinished(losers)) {
            const losersMatch = arrangeMatch(losers)
            if (losersMatch.status === 'matched') {
              const activeMatch = buildActiveMatch(
                losersMatch.redCompetitor,
                losersMatch.blueCompetitor,
              )
              advanceResult = buildMatchReadyResult(activeMatch)
              return {
                ...state,
                competitors,
                currentRound: round,
                currentMatchNumber: matchNumber,
                activeMatch,
              }
            }
          }
        }

        const byeCompetitors = competitors.filter((competitor) => competitor.bracket === 'Bye')
        if (byeCompetitors.length > 1) {
          for (const competitor of byeCompetitors) {
            competitor.byes = Math.max(0, competitor.byes - 1)
            competitor.previousParticipant = false
          }

          const byeMatch = arrangeMatch(byeCompetitors)
          if (byeMatch.status === 'matched') {
            const activeMatch = buildActiveMatch(
              byeMatch.redCompetitor,
              byeMatch.blueCompetitor,
            )
            advanceResult = buildMatchReadyResult(activeMatch)
            return {
              ...state,
              competitors,
              currentRound: round,
              currentMatchNumber: matchNumber,
              activeMatch,
            }
          }
        }

        const currentWinners = competitors.filter((competitor) => competitor.bracket === 'Winner')
        const currentLosers = competitors.filter((competitor) => competitor.bracket === 'Loser')
        if (isRoundOver(currentWinners, currentLosers)) {
          matchNumber = 0
          round += 1
          resetParticipants(currentWinners)
          resetParticipants(currentLosers)
          continue
        }

        advanceResult = { status: 'idle' }
        return {
          ...state,
          competitors,
          currentRound: round,
          currentMatchNumber: matchNumber,
          activeMatch: null,
        }
      }

      advanceResult = { status: 'idle' }
      return {
        ...state,
        competitors,
        currentRound: round,
        currentMatchNumber: matchNumber,
        activeMatch: null,
      }
    })

    return advanceResult
  },
  completeActiveMatch: (payload) => {
    let createdMatch: Match | null = null

    set((state) => {
      if (!state.activeMatch) {
        return state
      }

      const competitors = cloneCompetitors(state.competitors)
      const matches = cloneMatches(state.matches)
      const activeMatch = state.activeMatch
      const redCompetitor = competitors.find(
        (competitor) => competitor.competitorId === activeMatch.redCompetitorId,
      )
      const blueCompetitor = competitors.find(
        (competitor) => competitor.competitorId === activeMatch.blueCompetitorId,
      )

      if (!redCompetitor || !blueCompetitor) {
        return { ...state, competitors, activeMatch: null }
      }

      const elimination = toAllowedEliminationValue(state.elimination)
      if (payload.redWins) {
        redCompetitor.wins += 1
        blueCompetitor.losses += 1
        redCompetitor.bracket = 'Winner'
        blueCompetitor.bracket =
          blueCompetitor.losses >= elimination ? 'Eliminated' : 'Loser'
      } else {
        blueCompetitor.wins += 1
        redCompetitor.losses += 1
        blueCompetitor.bracket = 'Winner'
        redCompetitor.bracket = redCompetitor.losses >= elimination ? 'Eliminated' : 'Loser'
      }

      redCompetitor.isRedComp = false
      blueCompetitor.isBlueComp = false

      const startingLength = toTimeString(payload.startMinutes, payload.startSeconds)
      const matchEnd = toTimeString(payload.endMinutes, payload.endSeconds)
      const duration = toDuration(startingLength, matchEnd)

      const winner = payload.redWins ? redCompetitor : blueCompetitor
      const matchRecord = new Match({
        matchId: getNextMatchId(matches),
        roundNumber: activeMatch.round,
        matchNumber: activeMatch.matchNumber,
        bracket: redCompetitor.bracket,
        competitorRedScore: payload.redScore,
        competitorBlueScore: payload.blueScore,
        victoryMethod: payload.victoryMethod,
        startingLength,
        matchEnd,
        duration,
        competitorRedId: redCompetitor.competitorId,
        competitorBlueId: blueCompetitor.competitorId,
        competitorRed: redCompetitor,
        competitorBlue: blueCompetitor,
        winnerId: winner.competitorId,
        winner,
      })

      createdMatch = matchRecord

      return {
        ...state,
        competitors,
        matches: [...matches, matchRecord],
        currentRound: activeMatch.round,
        currentMatchNumber: activeMatch.matchNumber,
        activeMatch: null,
      }
    })

    return createdMatch
  },
  resetCompetitorsForNextEvent: () =>
    set((state) => ({
      competitors: cloneCompetitors(state.competitors).map(
        (competitor) =>
          new Competitor({
            ...competitor,
            bracket: 'Winner',
            place: 0,
            previousParticipant: false,
            lastMatch: false,
            byes: 0,
            wins: 0,
            losses: 0,
            isRedComp: false,
            isBlueComp: false,
          }),
      ),
      matches: [],
      currentRound: 0,
      currentMatchNumber: 0,
      activeMatch: null,
    })),
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
  resetTournament: () =>
    set({
      competitors: [],
      matches: [],
      elimination: 2,
      currentRound: 0,
      currentMatchNumber: 0,
      activeMatch: null,
    }),
}))
