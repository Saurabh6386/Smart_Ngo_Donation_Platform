import React from "react";
import "./Home.css"; // Import the CSS we just created
import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2 style={{ fontSize: "2rem", fontWeight: "300", margin: 0 }}>
            Together We Can
          </h2>
          <h1 className="hero-title">
            <span className="hero-highlight">Save Lives</span>
          </h1>
          <p className="hero-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ratione
            officiis laborum a veniam? Soluta debitis suscipit, id blanditiis
            illum numquam corrupti.
          </p>
          <Link to={user ? "/dashboard" : "/register"}>
            <button className="btn-primary">
              {user ? "Go to Dashboard" : "Start With A Little"}
            </button>
          </Link>
        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section className="section" id="about">
        <h2 className="section-title">About Us</h2>
        <div className="title-underline"></div>
        <p style={{ maxWidth: "800px", margin: "0 auto", color: "#666" }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi,
          nobis. Ipsum maxime perspiciatis deleniti, placeat beatae non eum,
          sapiente ea.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <h3>GIVE DONATION</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <Link to="/login">
              <button className="btn-outline">Donate Now</button>
            </Link>
          </div>
          <div className="about-card">
            <h3>BECOME A VOLUNTEER</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <button className="btn-outline">Become Now</button>
          </div>
          <div className="about-card">
            <h3>GIVE SCHOLARSHIP</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <button className="btn-outline">Give Immediately</button>
          </div>
        </div>
      </section>

      {/* 3. PROGRAMS SECTION */}
      <section
        className="section"
        style={{ background: "#f4f4f4" }}
        id="programs"
      >
        <h2 className="section-title">Programs</h2>
        <div className="title-underline"></div>

        <div className="programs-grid">
          {/* Program Card 1 */}
          <div className="program-card">
            <img src="../public/images/programs/1.jpg" alt="Education" />
            <div className="program-info">
              <h4>Education to every child</h4>
              <span className="donation-goal">Donation Goal: $9845</span>
              <Link to={user ? "/dashboard" : "/login"}>
                <button className="btn-donate-small">Donate Now</button>
              </Link>
            </div>
          </div>

          {/* Program Card 2 */}
          <div className="program-card">
            <img src="../public/images/programs/2.jpg" alt="Life" />
            <div className="program-info">
              <h4>Make life easier for them</h4>
              <span className="donation-goal">Donation Goal: $9845</span>
              <Link to="/login">
                <button className="btn-donate-small">Donate Now</button>
              </Link>
            </div>
          </div>

          {/* Program Card 3 */}
          <div className="program-card">
            <img src="../public/images/programs/3.jpg" alt="Kids" />
            <div className="program-info">
              <h4>Dedicating to helping kids</h4>
              <span className="donation-goal">Donation Goal: $9845</span>
              <Link to="/login">
                <button className="btn-donate-small">Donate Now</button>
              </Link>
            </div>
          </div>

          {/* Program Card 4 */}
          <div className="program-card">
            <img src="../public/images/programs/4.jpg" alt="Water" />
            <div className="program-info">
              <h4>Clean water for people</h4>
              <span className="donation-goal">Donation Goal: $9845</span>
              <Link to="/login">
                <button className="btn-donate-small">Donate Now</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EDUCATION PARALLAX SECTION */}
      <section className="education-section">
        <div className="hero-overlay"></div>
        <div className="education-content">
          <h3>EDUCATION</h3>
          <div
            className="title-underline"
            style={{ margin: "10px 0 20px 0", width: "50px" }}
          ></div>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
            Education Is Essential For <br /> BETTER FUTURE
          </h2>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
            Consequuntur ea culpa vitae commodi quos laboriosam qui consectetur
            esse nisi.
          </p>
          <button className="btn-primary" style={{ marginTop: "20px" }}>
            EXPLORE NOW
          </button>
        </div>
      </section>

      {/* 5. GALLERY SECTION */}
      <section className="section" id="gallery">
        <h2 className="section-title">Gallery</h2>
        <div className="title-underline"></div>
        <div className="gallery-grid">
          <img src="../public/images/gallery/1.jpg" alt="Gallery 1" />
          <img src="../public/images/gallery/2.jpg" alt="Gallery 2" />
          <img src="../public/images/gallery/3.jpg" alt="Gallery 3" />
          <img src="../public/images/gallery/4.jpg" alt="Gallery 4" />
        </div>
      </section>

      {/* 7. MAIN FOOTER */}
      <footer className="main-footer">
        <div className="footer-col">
          <h1
            style={{
              background: "#ff5252",
              padding: "5px 10px",
              display: "inline-block",
              color: "white",
            }}
          >
            NGO
          </h1>
          <p style={{ marginTop: "20px" }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem
            reprehenderit quam nobis possimus velit?
          </p>
          <input
            type="email"
            placeholder="Enter your email id"
            className="footer-input"
          />
        </div>

        <div className="footer-col">
          <h3>USEFUL LINKS</h3>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Programs</li>
            <li>Education</li>
            <li>Gallery</li>
            <li>Join Us</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>CONNECT WITH US</h3>
          <p>Saraswati Colony, Sehatpur, Faridabad</p>
          <p>121003, Haryana</p>
          <br />
          <p>info@ngo.com</p>
          <p>(+91) 9898989898</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
