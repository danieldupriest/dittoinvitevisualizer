# Ditto Invite Visualizer

Processes all user invitations to generate trees showing who invited who. It uses a TreeNode library I built which detects and avoids building cyclical references as children are added. If your largest tree is bigger than 100x100 characters, you will probably want to increase the default canvas width or height in the `tree.js` file.

## Setup

1. Clone repository
2. In root directory, run npm i
3. Copy config.js.sample to config.js and fill in the database instance info.
