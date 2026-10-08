// Extends app.json. On GitHub Pages the site lives under /<repo-name>/,
// so the deploy workflow sets EXPO_BASE_URL and Expo builds all links with that prefix.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
