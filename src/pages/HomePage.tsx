import { Link } from "react-router-dom";

const openBracketImageUrl = `${import.meta.env.BASE_URL}assets/openbracket_circular_badge.png`;

export function HomePage() {
  return (
    <main>
      <section className="home-hero home-outline">
        <div className="container">
          <h1 className="display-3 text-center">OpenBracket</h1>
          <h2 className="text-center">
            Welcome to OpenBracket
          </h2>
          <img
            className="img-fluid rounded-circle home-card-image home-big-pic mt-4"
            src={openBracketImageUrl}
            alt="OpenBracket logo"
          />
        </div>
      </section>

      <section className="home-outline">
        <div className="container px-5">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-6 order-lg-2">
              <div className="p-5 text-center">
                <img
                  className="img-fluid rounded-circle home-card-image"
                  src="https://images.unsplash.com/photo-1624938518616-3be0add427d1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  alt="Black and White Jiu Jitsu Photo"
                />
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="p-5">
                <h2 className="display-4">Tourney Organization Made Easy</h2>
                <p>
                  OpenBracket is a web based application that allows
                  grappling enthusiasts to run tournaments at a moment&apos;s
                  notice from any device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-outline">
        <div className="container px-5">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-6">
              <div className="p-5 text-center">
                <img
                  className="img-fluid rounded-circle home-card-image"
                  src="https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                  alt="Inverted Armbar"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-5">
                <h2 className="display-4">
                  Matchmaking, Scoring, Timing, and Results in One Place
                </h2>
                <p>
                  OpenBracket handles everything in one smooth integrated
                  experience. Enter a roster, choose single or double
                  elimination, and click start. It handles the rest.
                </p>
                <p className="mb-0">
                  <Link to="/about">Learn how the bracket logic works.</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-outline">
        <div className="container px-5">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-6 order-lg-2">
              <div className="p-5 text-center">
                <img
                  className="img-fluid rounded-circle home-card-image"
                  src="https://images.unsplash.com/photo-1611711605692-acb25d5d8399?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80"
                  alt="Another Black and White Jiu Jitsu Photo"
                />
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="p-5">
                <h2 className="display-4">
                  Knowledge is Power Privacy is King
                </h2>
                <p>
                  View results by competitor rankings or by match. Match results
                  are searchable by various metrics. We don&apos;t collect any
                  personal information, create your roster and start grappling.
                  That's it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-4">
        <h1>
          <Link to="/competitors">Setup your event today!</Link>
        </h1>
      </div>
    </main>
  );
}
