import { Link, useNavigate } from "react-router-dom";
import { useTournamentStore } from "../store/useTournamentStore";

function TrophyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="results-trophy"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M8 6H5a2 2 0 0 0 2 4h1M16 6h3a2 2 0 0 1-2 4h-1M12 11.5V16M9 20h6M10 16h4v4h-4v-4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function EventsResultsPage() {
  const competitors = useTournamentStore((state) => state.competitors);
  const resetCompetitorsForNextEvent = useTournamentStore(
    (state) => state.resetCompetitorsForNextEvent,
  );
  const navigate = useNavigate();

  const results = [...competitors].sort(
    (left, right) => left.place - right.place,
  );

  const handleResetForAnotherEvent = () => {
    resetCompetitorsForNextEvent();
    navigate("/competitors");
  };

  return (
    <main className="container py-4 page-events-results">
      <h1 className="text-center">Competitor Results</h1>

      <div className="table-responsive mt-4">
        <table className="table">
          <thead>
            <tr>
              <th>Place</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Byes</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((competitor) => (
                <tr key={competitor.competitorId}>
                  <td>
                    <span className="results-place">
                      {competitor.place}
                      {competitor.place === 1 ? (
                        <>
                          <TrophyIcon />
                          <span className="visually-hidden">First place</span>
                        </>
                      ) : null}
                    </span>
                  </td>
                  <td>{competitor.firstName}</td>
                  <td>{competitor.lastName}</td>
                  <td>{competitor.wins}</td>
                  <td>{competitor.losses}</td>
                  <td>{competitor.byes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No competitors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="container match-outline">
        <div className="row">
          <div className="col match-outline p-3">
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={handleResetForAnotherEvent}
            >
              Reset Competitors for another event
            </button>
          </div>
          <div className="col match-outline p-3">
            <Link to="/events/history">View Results by Match</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
