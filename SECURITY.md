# Security

## Dependency audit exception

`react-router-dom` 7.18.1 currently receives `GHSA-qwww-vcr4-c8h2` from `npm audit`.
The upstream advisory states that the issue only affects applications using React
Router's unstable React Server Components APIs. Run Together is a static Vite SPA
using declarative `BrowserRouter`; it has no React Server Components, server
actions, loaders, or React Router server runtime.

The suggested npm downgrade to 7.11.0 is not accepted because it reintroduces
older vulnerabilities fixed by 7.18.1. The production audit script permits only
this exact advisory and fails for every other production vulnerability. Upgrade
to the first stable patched React Router release when it is published.

Reference: https://github.com/advisories/GHSA-qwww-vcr4-c8h2
