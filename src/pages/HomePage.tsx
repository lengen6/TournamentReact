import { Link } from "react-router-dom";

const openBracketImageUrl = `${import.meta.env.BASE_URL}assets/openbracket_circular_badge.png`;

type HomeFeatureCard = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel?: string;
  ctaTo?: string;
};

const homeFeatureCards: HomeFeatureCard[] = [
  {
    title: "Tourney Organization Made Easy",
    description:
      "OpenBracket is a web based application that allows grappling enthusiasts to run tournaments at a moment's notice from any device.",
    imageUrl:
      "https://images.unsplash.com/photo-1624938518616-3be0add427d1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    imageAlt: "Black and White Jiu Jitsu Photo",
  },
  {
    title: "Matchmaking, Scoring, Timing, and Results in One Place",
    description:
      "OpenBracket handles everything in one smooth integrated experience. Enter a roster, choose single or double elimination, and click start. It handles the rest.",
    imageUrl:
      "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    imageAlt: "Inverted Armbar",
    ctaLabel: "Learn how the bracket logic works.",
    ctaTo: "/about",
  },
  {
    title: "Knowledge is Power Privacy is King",
    description:
      "View results by competitor rankings or by match. Match results are searchable by various metrics. We don't collect any personal information, create your roster and start grappling. That's it.",
    imageUrl:
      "https://images.unsplash.com/photo-1611711605692-acb25d5d8399?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
    imageAlt: "Another Black and White Jiu Jitsu Photo",
  },
];

export function HomePage() {
  return (
    <main className="page-home">
      <section className="home-shell home-hero-panel">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-kicker mb-2">Tournament operations, modernized</p>
            <h1 className="home-title mb-3">OpenBracket</h1>
            <h2 className="home-subtitle mb-4">Welcome to OpenBracket</h2>
            <div className="home-hero-actions">
              <Link className="btn btn-primary home-btn-primary" to="/competitors">
                Setup your event today!
              </Link>
              <Link className="btn btn-outline-primary home-btn-secondary" to="/about">
                Learn how the bracket logic works
              </Link>
            </div>
          </div>
          <div className="home-logo-stage" aria-hidden="true">
            <div className="home-logo-ring">
              <img className="home-logo-mark" src={openBracketImageUrl} alt="" />
            </div>
            <div className="home-logo-tag">Single and Double Elimination</div>
            <div className="home-logo-tag">Matchmaking, Timing, Results</div>
          </div>
        </div>
      </section>

      <section className="home-shell home-features-panel">
        <div className="container home-features-grid">
          {homeFeatureCards.map((card) => (
            <article key={card.title} className="home-feature-card">
              <div className="home-feature-image-wrap">
                <img
                  className="home-feature-image"
                  src={card.imageUrl}
                  alt={card.imageAlt}
                />
              </div>
              <div className="home-feature-body">
                <h3 className="home-feature-title">{card.title}</h3>
                <p className="home-feature-text">{card.description}</p>
                {card.ctaTo ? (
                  <p className="mb-0">
                    <Link className="home-feature-link" to={card.ctaTo}>
                      {card.ctaLabel}
                    </Link>
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-shell home-cta-panel">
        <div className="container home-cta-content">
          <h2 className="home-cta-title mb-2">Ready to run your next event?</h2>
          <p className="home-cta-text mb-0">
            Setup your event today and start your bracket in minutes.
          </p>
          <Link className="btn btn-primary home-btn-primary mt-3" to="/competitors">
            Setup your event today!
          </Link>
        </div>
      </section>
    </main>
  );
}
