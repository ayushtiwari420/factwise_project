# FactWise Quarantine Care

A React and Vite frontend prototype for hospital care operations. It includes patient registry, temperature checks, doctor rounds, discharge eligibility, operational analytics, and a demo role selector.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run build
npm run lint
```

## Demo behavior

Patient data, temperature readings, visits, discharge records, care settings, and the selected demo role are stored in the browser's local storage. Use **Settings → Reset demo data** to restore the sample records.

The role selector changes the visible navigation and selected actions for demonstration purposes. It is not production authentication or access control. The prototype does not send patient data to a server.

Discharge eligibility requires an actual temperature reading for every consecutive fever-free day. Missing readings do not count as evidence. The analytics mortality denominator is the number of recorded discharge outcomes; this demo currently has no death outcome entry workflow.

## Deployment

The Vite production build is ready for static hosting. Client-side routes are supported by `vercel.json`. A GitHub remote and Vercel deployment still need account authorization.
