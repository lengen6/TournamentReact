const { useTournamentStore } = require('../test-dist/store/useTournamentStore.js')
const { Competitor } = require('../test-dist/models/Competitor.js')

const defaultMatchPayload = {
  redWins: true,
  redScore: 6,
  blueScore: 2,
  victoryMethod: 'Points',
  startMinutes: 5,
  startSeconds: 0,
  endMinutes: 1,
  endSeconds: 30,
}

const resetStore = () => {
  useTournamentStore.getState().resetTournament()
}

const createRoster = (count) => {
  for (let index = 0; index < count; index += 1) {
    useTournamentStore.getState().addCompetitor({
      firstName: `F${index + 1}`,
      lastName: `L${index + 1}`,
    })
  }
}

const seedCompetitors = (entries) => {
  const competitors = entries.map((entry, index) =>
    new Competitor({
      competitorId: entry.competitorId ?? index + 1,
      firstName: entry.firstName ?? `F${index + 1}`,
      lastName: entry.lastName ?? `L${index + 1}`,
      wins: entry.wins ?? 0,
      losses: entry.losses ?? 0,
      byes: entry.byes ?? 0,
      place: entry.place ?? 0,
      isRedComp: entry.isRedComp ?? false,
      isBlueComp: entry.isBlueComp ?? false,
      bracket: entry.bracket ?? 'Winner',
      previousParticipant: entry.previousParticipant ?? false,
      lastMatch: entry.lastMatch ?? false,
    }),
  )

  useTournamentStore.getState().setCompetitors(competitors)
  return competitors
}

const completeActiveMatch = (overrides = {}) =>
  useTournamentStore
    .getState()
    .completeActiveMatch({ ...defaultMatchPayload, ...overrides })

const mockRandomSequence = (values) => {
  const sequence = Array.isArray(values) ? values : [values]
  let cursor = 0

  return jest.spyOn(Math, 'random').mockImplementation(() => {
    if (sequence.length === 0) {
      return 0
    }
    const nextValue =
      cursor < sequence.length ? sequence[cursor] : sequence[sequence.length - 1]
    cursor += 1
    return nextValue
  })
}

beforeEach(() => {
  resetStore()
})

afterEach(() => {
  jest.restoreAllMocks()
  resetStore()
})

test('returns competitor_count_error when fewer than two competitors are available', () => {
  createRoster(1)
  useTournamentStore.getState().beginEvent(2)

  const result = useTournamentStore.getState().advanceEvent()

  expect(result).toEqual({ status: 'competitor_count_error' })
  expect(useTournamentStore.getState().activeMatch).toBeNull()
})

test('keeps returning the current active match until it is completed', () => {
  createRoster(2)
  useTournamentStore.getState().beginEvent(2)
  mockRandomSequence(0)

  const firstResult = useTournamentStore.getState().advanceEvent()
  const secondResult = useTournamentStore.getState().advanceEvent()

  expect(firstResult.status).toBe('match_ready')
  expect(secondResult.status).toBe('match_ready')
  expect(secondResult.activeMatch).toEqual(firstResult.activeMatch)
  expect(useTournamentStore.getState().currentMatchNumber).toBe(1)
})

test('completeActiveMatch returns null when no active match exists', () => {
  createRoster(2)
  useTournamentStore.getState().beginEvent(2)

  const result = completeActiveMatch()

  expect(result).toBeNull()
})

test('double elimination sends the first loser to the losers bracket', () => {
  createRoster(2)
  useTournamentStore.getState().beginEvent(2)
  mockRandomSequence(0)

  const active = useTournamentStore.getState().advanceEvent()
  expect(active.status).toBe('match_ready')

  const match = completeActiveMatch({
    redWins: true,
    redScore: 9,
    blueScore: 2,
    victoryMethod: 'Submission',
    startMinutes: 5,
    startSeconds: 0,
    endMinutes: 1,
    endSeconds: 30,
  })

  expect(match).not.toBeNull()
  expect(match.winnerId).toBe(match.competitorRedId)
  expect(match.duration).toBe('03:30')

  const competitors = useTournamentStore.getState().competitors
  const winner = competitors.find(
    (competitor) => competitor.competitorId === match.winnerId,
  )
  const loser = competitors.find(
    (competitor) => competitor.competitorId !== match.winnerId,
  )

  expect(winner.wins).toBe(1)
  expect(winner.bracket).toBe('Winner')
  expect(loser.losses).toBe(1)
  expect(loser.bracket).toBe('Loser')
})

test('single elimination immediately eliminates the first loser', () => {
  createRoster(2)
  useTournamentStore.getState().beginEvent(1)
  mockRandomSequence(0)

  const active = useTournamentStore.getState().advanceEvent()
  expect(active.status).toBe('match_ready')

  const match = completeActiveMatch({ redWins: false, victoryMethod: 'Decision' })
  expect(match).not.toBeNull()

  const competitors = useTournamentStore.getState().competitors
  const loser = competitors.find((competitor) => competitor.competitorId === match.competitorRedId)

  expect(loser.losses).toBe(1)
  expect(loser.bracket).toBe('Eliminated')
})

test('assigns losers-bracket bye to the loser with the fewest wins', () => {
  seedCompetitors([
    { competitorId: 1, bracket: 'Winner', wins: 3 },
    { competitorId: 2, bracket: 'Winner', wins: 1 },
    { competitorId: 3, bracket: 'Loser', wins: 0 },
    { competitorId: 4, bracket: 'Loser', wins: 2 },
    { competitorId: 5, bracket: 'Loser', wins: 4 },
  ])
  useTournamentStore.setState({
    currentRound: 2,
    currentMatchNumber: 0,
    roundByeAssigned: false,
    activeMatch: null,
  })
  mockRandomSequence(0)

  const result = useTournamentStore.getState().advanceEvent()
  expect(result.status).toBe('match_ready')

  const competitors = useTournamentStore.getState().competitors
  const lowestWinLoser = competitors.find(
    (competitor) => competitor.competitorId === 3,
  )

  expect(lowestWinLoser.byes).toBe(1)
  expect(lowestWinLoser.previousParticipant).toBe(true)
  expect(useTournamentStore.getState().roundByeAssigned).toBe(true)
})

test('breaks loser bye ties randomly among the lowest-win competitors', () => {
  seedCompetitors([
    { competitorId: 1, bracket: 'Winner', wins: 3 },
    { competitorId: 2, bracket: 'Winner', wins: 2 },
    { competitorId: 3, bracket: 'Loser', wins: 1 },
    { competitorId: 4, bracket: 'Loser', wins: 1 },
    { competitorId: 5, bracket: 'Loser', wins: 5 },
  ])
  useTournamentStore.setState({
    currentRound: 1,
    currentMatchNumber: 0,
    roundByeAssigned: false,
    activeMatch: null,
  })
  mockRandomSequence(0.99)

  const result = useTournamentStore.getState().advanceEvent()
  expect(result.status).toBe('match_ready')

  const competitors = useTournamentStore.getState().competitors
  const firstTiedLoser = competitors.find((competitor) => competitor.competitorId === 3)
  const secondTiedLoser = competitors.find((competitor) => competitor.competitorId === 4)

  expect(firstTiedLoser.byes).toBe(0)
  expect(secondTiedLoser.byes).toBe(1)
})

test('when winners are odd it pairs lowest-win winner against highest-win loser after bye assignment', () => {
  seedCompetitors([
    { competitorId: 1, bracket: 'Winner', wins: 0 },
    { competitorId: 2, bracket: 'Winner', wins: 2 },
    { competitorId: 3, bracket: 'Winner', wins: 4 },
    { competitorId: 4, bracket: 'Loser', wins: 0 },
    { competitorId: 5, bracket: 'Loser', wins: 6 },
  ])
  useTournamentStore.setState({
    currentRound: 3,
    currentMatchNumber: 0,
    roundByeAssigned: false,
    activeMatch: null,
  })
  mockRandomSequence(0)

  const result = useTournamentStore.getState().advanceEvent()
  expect(result.status).toBe('match_ready')

  expect(result.activeMatch.redCompetitorId).toBe(1)
  expect(result.activeMatch.blueCompetitorId).toBe(5)
  expect(result.activeMatch.bracket).toBe('Winner')

  const competitors = useTournamentStore.getState().competitors
  const loserByeRecipient = competitors.find((competitor) => competitor.competitorId === 4)

  expect(loserByeRecipient.byes).toBe(1)
})

test('runs through a full double-elimination event and produces final placements', () => {
  createRoster(4)
  useTournamentStore.getState().beginEvent(2)
  mockRandomSequence(0)

  let finalResult = { status: 'idle' }
  for (let iteration = 0; iteration < 30; iteration += 1) {
    const result = useTournamentStore.getState().advanceEvent()
    finalResult = result

    if (result.status === 'results') {
      break
    }

    expect(result.status).toBe('match_ready')
    completeActiveMatch({ redWins: true })
  }

  expect(finalResult.status).toBe('results')

  const { competitors, matches } = useTournamentStore.getState()
  const championCount = competitors.filter((competitor) => competitor.place === 1).length
  const allHavePlacement = competitors.every((competitor) => competitor.place > 0)

  expect(championCount).toBe(1)
  expect(allHavePlacement).toBe(true)
  expect(matches.length).toBeGreaterThan(0)
})

test('clears stale active matches when a scheduled competitor no longer exists', () => {
  createRoster(2)
  useTournamentStore.getState().beginEvent(2)
  mockRandomSequence(0)

  const active = useTournamentStore.getState().advanceEvent()
  expect(active.status).toBe('match_ready')

  const remainingCompetitors = useTournamentStore
    .getState()
    .competitors.filter(
      (competitor) => competitor.competitorId !== active.activeMatch.blueCompetitorId,
    )
  useTournamentStore.getState().setCompetitors(remainingCompetitors)

  const result = completeActiveMatch()
  expect(result).toBeNull()
  expect(useTournamentStore.getState().activeMatch).toBeNull()
})

test('normalizes invalid elimination values to supported defaults', () => {
  createRoster(2)
  useTournamentStore.getState().beginEvent(99)

  expect(useTournamentStore.getState().elimination).toBe(2)

  useTournamentStore.getState().setElimination(1)
  expect(useTournamentStore.getState().elimination).toBe(1)

  useTournamentStore.getState().setElimination(-5)
  expect(useTournamentStore.getState().elimination).toBe(2)
})
