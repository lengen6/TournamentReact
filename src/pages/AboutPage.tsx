export function AboutPage() {
  return (
    <main className="container py-4 page-about">
      <h1 className="mb-3">About Tie Ren Tournament</h1>
      <p className="mb-4">
        This page explains the default bracket flow in clear, step-by-step terms.
      </p>

      <h2 className="h4 mb-3">Default Bracket Logic</h2>
      <ul className="mb-4">
        <li>Initial first-round pairings are random.</li>
        <li>After round one, winners move to the winners&apos; bracket and losers move to the losers&apos; bracket.</li>
        <li>If there is an odd number of participants in a bracket, one competitor receives a bye.</li>
        <li>
          If the losers&apos; bracket is odd, the bye goes to the loser with the fewest wins. If multiple
          competitors are tied, one is selected at random.
        </li>
        <li>
          If the winners&apos; bracket is odd, the losers&apos; bracket bye is still assigned first using the same
          fewest-wins rule.
        </li>
        <li>
          Then, the winner with the fewest wins is matched against the loser with the most wins. Any ties are
          broken randomly.
        </li>
        <li>
          Tournaments can run in single-elimination or double-elimination mode and continue until only one
          competitor remains.
        </li>
      </ul>

      <h2 className="h4 mb-3">New Modes Coming Soon!</h2>
      <ul className="mb-0">
        <li>Additional tournament formats are in progress.</li>
      </ul>
    </main>
  )
}
