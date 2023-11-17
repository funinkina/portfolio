import React from "react";
import NavBar from "./components/navbar.jsx";
import Home from "./components/home.jsx";
import RecentProjects from "./components/recentproj.jsx";
import ArtWorks from "./components/artworks.jsx";
import Contact from "./components/contact.jsx";
import Lenis from "@studio-freight/lenis";

function App() {
  const lenis = new Lenis({
    //larp: 0.5,
    duration: 0.8,
    easing: (t) => 1 - Math.pow(1 - t, 5),
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return (
    <>
      <NavBar />
      <Home />
      <RecentProjects />
      <ArtWorks />
      <Contact />
    </>
  );
}

export default App;
