import { Link, useNavigate } from "react-router-dom";
import { useTournamentStore } from "../store/useTournamentStore";

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
    <main className="container py-4">
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
              <th>Bracket</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((competitor) => (
                <tr key={competitor.competitorId}>
                  <td>{competitor.place}</td>
                  <td>{competitor.firstName}</td>
                  <td>{competitor.lastName}</td>
                  <td>{competitor.wins}</td>
                  <td>{competitor.losses}</td>
                  <td>{competitor.byes}</td>
                  <td>{competitor.bracket}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-muted">
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
