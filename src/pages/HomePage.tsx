import { Link } from "react-router-dom";

const openBracketImageUrl = `${import.meta.env.BASE_URL}assets/openbracket_logo_teal.png`;
const card1ImageUrl = `${import.meta.env.BASE_URL}assets/card1.jpg`;
const card2ImageUrl = `${import.meta.env.BASE_URL}assets/card2.png`;
const card3ImageUrl = `${import.meta.env.BASE_URL}assets/card3.jpg`;
const card4ImageUrl = `${import.meta.env.BASE_URL}assets/card4.png`;

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
      "OPEN[bracket] is a web based application that allows martial arts enthusiasts to run tournaments at a moment's notice from any device.",
    imageUrl: card1ImageUrl,
    imageAlt: "Grayscale Muay Thai photo",
  },
  {
    title: "Matchmaking, Scoring, Timing, and Results All in One Place",
    description:
      "OPEN[bracket] handles everything in one smooth integrated experience. Enter a roster, choose single or double elimination, and click start. It handles the rest.",
    imageUrl: card2ImageUrl,
    imageAlt: "Inverted Armbar",
    ctaLabel: "Learn how the bracket logic works.",
    ctaTo: "/about",
  },
  {
    title: "Knowledge is Power Privacy is King",
    description:
      "View results by competitor rankings or by match. Match results are searchable by various metrics. We don't collect any personal information, create your roster and start competing. That's it.",
    imageUrl: card3ImageUrl,
    imageAlt: "Muay Thai Sparring Photo",
  },
  {
    title: "Adjustable Standalone Timer",
    description:
      "Need only the clock and score controls? Run the standalone timer to manage match length, rest rounds, points, and outcomes without creating a full event in OPEN[bracket]. Perfect for open mats and practices.",
    imageUrl: card4ImageUrl,
    imageAlt: "Another Black and White Jiu Jitsu Photo",
    ctaLabel: "Open the standalone timer.",
    ctaTo: "/standalone-match",
  },
];

export function HomePage() {
  return (
    <main className="page-home">
      <section className="home-shell home-hero-panel">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-kicker mb-3">
              Tournament operations, modernized
            </p>
            <h1 className="home-title mb-4">OPEN[bracket]</h1>
            <div className="home-hero-actions">
              <Link
                className="btn btn-primary home-btn-primary"
                to="/competitors"
              >
                Setup your event today!
              </Link>
              <Link
                className="btn btn-outline-primary home-btn-secondary"
                to="/about"
              >
                Learn how the bracket logic works
              </Link>
            </div>
          </div>
          <div className="home-logo-stage" aria-hidden="true">
            <div className="home-logo-ring">
              <img
                className="home-logo-mark"
                src={openBracketImageUrl}
                alt=""
              />
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
          <Link
            className="btn btn-primary home-btn-primary mt-3"
            to="/competitors"
          >
            Setup your event today!
          </Link>
        </div>
      </section>
    </main>
  );
}
