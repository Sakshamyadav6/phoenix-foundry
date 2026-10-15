# Phoenix Foundry

Website for Phoenix Foundry, the student founder incubator at UW-Green Bay. Built with React and Vite.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

## Fill in the placeholders

Anything still missing shows on the page as a dashed `[PLACEHOLDER]` box. All of it is set in one file, `src/config.js`:

- **Logo**: put the file in `public/` (e.g. `public/logo.svg`) and set `logo: 'logo.svg'`.
- **Links**: Phoenix Connect, cohort application, Instagram.
- **Instagram handle** and **email**.
- **Next event**: name, date, location.
- **Team**: each officer's name and photo (put photos in `public/team/`).
- **Advisor**: last name.

## Project layout

```
src/
  config.js          placeholders and links
  index.css          all styles (colors and fonts are tokens at the top)
  App.jsx            page sections in order
  components/
    Nav.jsx          sticky nav + mobile menu
    Hero.jsx         horizontal hero: three chapters, growth curve, jargon, phoenix
    WhoWeAre.jsx     statement that inks in on scroll, Learn/Build/Launch loop, the name
    WhoCanJoin.jsx   rotating majors slot + "Where are you right now?" path finder
    WhatToExpect.jsx Community/Cohort switch + sticky five-stage journey tracker
    HowToJoin.jsx    launch checklist (remembered in the browser) + next-event ticket
    Team.jsx         officer cards + advisor
    Footer.jsx       wordmark, links, live Green Bay time
    Mascot.jsx       Uni the unicorn (tap for a tip)
    shared.jsx       Reveal (rise-on-scroll), SectionHead, links, placeholders
```

## Deploy

`npm run build` outputs a static site in `dist/`. Upload that folder to any static host (GitHub Pages, Netlify, Vercel, or UWGB web space). Asset paths are relative, so it works from a subfolder too.
