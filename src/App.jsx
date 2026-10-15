import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import WhoWeAre from './components/WhoWeAre.jsx';
import WhoCanJoin from './components/WhoCanJoin.jsx';
import WhatToExpect from './components/WhatToExpect.jsx';
import HowToJoin from './components/HowToJoin.jsx';
import Team from './components/Team.jsx';
import Footer from './components/Footer.jsx';
import Mascot from './components/Mascot.jsx';
import { useAnvilSparks } from './components/shared.jsx';

export default function App() {
  useAnvilSparks();

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <WhoWeAre />
        <WhoCanJoin />
        <WhatToExpect />
        <HowToJoin />
        <Team />
      </main>
      <Footer />
      <Mascot />
    </>
  );
}
