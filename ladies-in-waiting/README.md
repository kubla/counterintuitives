# Ladies-in-Waiting

A web-native historical explainer about the noble women who lived inside the radius of royal power.

The experience uses a different interface for each kind of historical information: annotated painting, spatial access model, time-of-day scrollytelling, comparative timeline, switchable court hierarchies, precedence interaction, influence network, narrative case study, and institutional decomposition.

## Run locally

```bash
npm install
npm run dev
```

Build the static production bundle with:

```bash
npm run build
```

## Structure

- `src/App.tsx` — content, interactions, court data, and source links
- `src/styles.css` — complete art direction, motion, and responsive layout
- `src/main.tsx` — React entry point

Artwork is loaded from public or institutional image endpoints. Historical claims and artwork records are linked in the page footer. This is the first working draft migrated from ChatGPT Sites for iterative development.
