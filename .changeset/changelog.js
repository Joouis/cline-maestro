/** @type {import("@changesets/types").ChangelogFunctions} */
module.exports = {
  // We're not using dependency updates:
  getDependencyReleaseLine: () => Promise.resolve(""),

  // The `changesets` array contains all of the summaries (minor + patch)
  getReleaseLine: async ({ summary }) => `- ${summary}`,
};
