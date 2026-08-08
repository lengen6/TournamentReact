import {
  getMaximumEventCompetitors,
  type EventMode,
} from '../store/useTournamentStore'

type EventModeSummary = {
  title: string
  eventMode: EventMode
  elimination: number
  description: string
  detail: string
}

const eventModes: EventModeSummary[] = [
  {
    title: 'Single Elimination',
    eventMode: 'elimination',
    elimination: 1,
    description: 'A fast bracket where one loss removes a competitor from contention.',
    detail: 'Best for larger rosters when the event needs a clear winner quickly.',
  },
  {
    title: 'Double Elimination',
    eventMode: 'elimination',
    elimination: 2,
    description: 'A bracket where competitors remain live until their second loss.',
    detail: 'Best for giving everyone a second chance while still keeping bracket pressure.',
  },
  {
    title: 'Round Robin',
    eventMode: 'round_robin',
    elimination: 2,
    description: 'A schedule where every competitor faces every other competitor once.',
    detail: 'Best for smaller groups where complete head-to-head results matter most.',
  },
]

export function AboutPage() {
  return (
    <main className="page-about">
      <section className="about-hero">
        <p className="about-kicker mb-2">Event Formats</p>
        <h1>About OPEN[bracket]</h1>
        <p className="about-lede mb-0">
          OPEN[bracket] supports elimination brackets and round-robin events while
          keeping the same live match controls for timing, scoring, and result history.
        </p>
      </section>

      <section className="about-mode-grid" aria-label="Event mode limits">
        {eventModes.map((mode) => (
          <article className="about-mode-card" key={mode.title}>
            <div>
              <p className="about-mode-limit mb-2">
                Up to {getMaximumEventCompetitors(mode.eventMode, mode.elimination)}
              </p>
              <h2>{mode.title}</h2>
              <p>{mode.description}</p>
            </div>
            <p className="about-mode-detail mb-0">{mode.detail}</p>
          </article>
        ))}
      </section>

      <section className="about-logic-grid">
        <article className="about-logic-panel">
          <p className="about-section-label mb-2">Elimination Logic</p>
          <h2>Single and double elimination</h2>
          <ul>
            <li>Initial first-round pairings are random.</li>
            <li>Winners remain in the winners bracket after each match.</li>
            <li>Single-elimination competitors are removed after one loss.</li>
            <li>Double-elimination competitors move to the losers bracket after one loss and are removed after two losses.</li>
            <li>Odd brackets assign a bye, favoring the losers bracket competitor with the fewest wins when possible.</li>
            <li>If the winners bracket is odd, the lowest-win winner can be paired with the highest-win loser.</li>
          </ul>
        </article>

        <article className="about-logic-panel">
          <p className="about-section-label mb-2">Round Robin Logic</p>
          <h2>Every matchup once</h2>
          <ul>
            <li>Every competitor faces every other competitor exactly one time.</li>
            <li>Pairings are scheduled by round so competitors are not repeated within the same round.</li>
            <li>No competitor is eliminated during the event.</li>
            <li>Final placement is ranked by wins, then losses, then score differential.</li>
            <li>Round-robin matches use the same timer, scoring controls, victory methods, and match-history records.</li>
          </ul>
        </article>
      </section>
    </main>
  )
}
