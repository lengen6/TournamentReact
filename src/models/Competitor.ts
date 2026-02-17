export class Competitor {
  competitorId = 0
  firstName = ''
  lastName = ''
  wins = 0
  losses = 0
  byes = 0
  place = 0
  isRedComp = false
  isBlueComp = false
  bracket = 'Winner'
  previousParticipant = false
  lastMatch = false

  constructor(init: Partial<Competitor> = {}) {
    Object.assign(this, init)
  }
}
