import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTournamentStore } from '../store/useTournamentStore'

export function EventsHistoryPage() {
  const matches = useTournamentStore((state) => state.matches)
  const [competitorFirstNameSearch, setCompetitorFirstNameSearch] = useState('')
  const [competitorLastNameSearch, setCompetitorLastNameSearch] = useState('')
  const [winnerFirstNameSearch, setWinnerFirstNameSearch] = useState('')
  const [winnerLastNameSearch, setWinnerLastNameSearch] = useState('')
  const [pointsSearch, setPointsSearch] = useState('')
  const [victoryMethodSearch, setVictoryMethodSearch] = useState('')

  const filteredMatches = useMemo(() => {
    const minimumPoints = pointsSearch ? Number(pointsSearch) : 0

    return matches.filter((match) => {
      if (
        competitorFirstNameSearch &&
        !match.competitorRed?.firstName
          .toLowerCase()
          .includes(competitorFirstNameSearch.toLowerCase()) &&
        !match.competitorBlue?.firstName
          .toLowerCase()
          .includes(competitorFirstNameSearch.toLowerCase())
      ) {
        return false
      }

      if (
        competitorLastNameSearch &&
        !match.competitorRed?.lastName
          .toLowerCase()
          .includes(competitorLastNameSearch.toLowerCase()) &&
        !match.competitorBlue?.lastName
          .toLowerCase()
          .includes(competitorLastNameSearch.toLowerCase())
      ) {
        return false
      }

      if (
        winnerFirstNameSearch &&
        !match.winner?.firstName.toLowerCase().includes(winnerFirstNameSearch.toLowerCase())
      ) {
        return false
      }

      if (
        winnerLastNameSearch &&
        !match.winner?.lastName.toLowerCase().includes(winnerLastNameSearch.toLowerCase())
      ) {
        return false
      }

      if (
        pointsSearch &&
        !Number.isNaN(minimumPoints) &&
        match.competitorRedScore < minimumPoints &&
        match.competitorBlueScore < minimumPoints
      ) {
        return false
      }

      if (
        victoryMethodSearch &&
        !match.victoryMethod.toLowerCase().includes(victoryMethodSearch.toLowerCase())
      ) {
        return false
      }

      return true
    })
  }, [
    competitorFirstNameSearch,
    competitorLastNameSearch,
    matches,
    pointsSearch,
    victoryMethodSearch,
    winnerFirstNameSearch,
    winnerLastNameSearch,
  ])

  return (
    <main className="container py-4">
      <h3>Filter Results by:</h3>
      <br />
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Red/Blue Name</th>
              <th>Winner Name</th>
              <th>Points Scored</th>
              <th>Victory Method</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p className="mb-2">
                  First Name:{' '}
                  <input
                    type="text"
                    value={competitorFirstNameSearch}
                    onChange={(event) => setCompetitorFirstNameSearch(event.target.value)}
                  />
                </p>
                <p className="mb-0">
                  Last Name:{' '}
                  <input
                    type="text"
                    value={competitorLastNameSearch}
                    onChange={(event) => setCompetitorLastNameSearch(event.target.value)}
                  />
                </p>
              </td>
              <td>
                <p className="mb-2">
                  First Name:{' '}
                  <input
                    type="text"
                    value={winnerFirstNameSearch}
                    onChange={(event) => setWinnerFirstNameSearch(event.target.value)}
                  />
                </p>
                <p className="mb-0">
                  Last Name:{' '}
                  <input
                    type="text"
                    value={winnerLastNameSearch}
                    onChange={(event) => setWinnerLastNameSearch(event.target.value)}
                  />
                </p>
              </td>
              <td>
                <p className="mb-0">
                  Equal or Greater than:{' '}
                  <input
                    type="text"
                    value={pointsSearch}
                    onChange={(event) => setPointsSearch(event.target.value)}
                  />
                </p>
                <p className="mb-0">(Either Competitor)</p>
              </td>
              <td>
                <select
                  value={victoryMethodSearch}
                  onChange={(event) => setVictoryMethodSearch(event.target.value)}
                >
                  <option value=""></option>
                  <option value="Submission">Submission</option>
                  <option value="Points">Points</option>
                  <option value="Decision">Decision</option>
                  <option value="Opponent Disqualification">DQ</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Round #</th>
              <th>Match #</th>
              <th>Red Competitor</th>
              <th>Blue Competitor</th>
              <th>Red Score</th>
              <th>Blue Score</th>
              <th>Winner</th>
              <th>Victory By</th>
              <th>Starting Length</th>
              <th>Match End</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <tr key={match.matchId}>
                  <td>{match.roundNumber}</td>
                  <td>{match.matchNumber}</td>
                  <td>
                    {match.competitorRed?.firstName} {match.competitorRed?.lastName}
                  </td>
                  <td>
                    {match.competitorBlue?.firstName} {match.competitorBlue?.lastName}
                  </td>
                  <td>{match.competitorRedScore}</td>
                  <td>{match.competitorBlueScore}</td>
                  <td>
                    {match.winner?.firstName} {match.winner?.lastName}
                  </td>
                  <td>{match.victoryMethod}</td>
                  <td>{match.startingLength}</td>
                  <td>{match.matchEnd}</td>
                  <td>{match.duration}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center text-muted">
                  No matches found with the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Link to="/events/results">Back to Player Results</Link>
    </main>
  )
}
