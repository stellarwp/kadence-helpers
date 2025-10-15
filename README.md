# kadence-helpers
Helper functions for Kadence components

## Text Domain Placeholder

All translatable strings now use the placeholder text domain `__KADENCE__TEXT__DOMAIN__`. Projects that consume this package should replace the placeholder with their own text domain as part of the build step (for example using Webpack's `DefinePlugin` or a scripted search-and-replace) so translations map correctly.
