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
    Hero.jsx         headline and buttons
    Embers.jsx       rising sparks in the hero
    WhoWeAre.jsx     mission, name, Learn / Build / Launch
    WhoCanJoin.jsx   three paths in
    WhatToExpect.jsx Community vs Cohort + 5-stage timeline
    HowToJoin.jsx    three steps + join buttons
    Team.jsx         officer cards + advisor
    Footer.jsx
    shared.jsx       Reveal (rise-on-scroll), links, placeholders
```

## Deploy

`npm run build` outputs a static site in `dist/`. Upload that folder to any static host (GitHub Pages, Netlify, Vercel, or UWGB web space). Asset paths are relative, so it works from a subfolder too.
