import type { Competitor } from './Competitor'

export class Match {
  matchId = 0
  competitorRedScore = 0
  competitorBlueScore = 0
  matchEnd = '0'
  startingLength = '0'
  duration = '0'
  roundNumber = 0
  matchNumber = 0
  victoryMethod = 'Default'
  bracket = ''
  competitorRedId?: number
  competitorRed?: Competitor
  competitorBlueId?: number
  competitorBlue?: Competitor
  winnerId?: number
  winner?: Competitor

  constructor(init: Partial<Match> = {}) {
    Object.assign(this, init)
  }
}
