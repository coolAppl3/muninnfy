# Changelog

## [0.0.5] (2024-08-12)

### Features

- Added font files for Italic bold `Work Sans`.
- Implemented Hero section in Home page.
- Implemented Features section in Home page.
- Added multiple SVGs.


### Bug Fixes

- Fixed home links in `Navbars` component not being highlighted as active when in the pathname is at the root.


### Code Refactoring

- Refactored CSS to a mobile-first approach.
- Other minor refactors.


## [0.0.4] (2024-08-09)

### Features

- Added local `TopNavbar` component under `Navbars`.
  - Further clarification can be found in the refactoring section.
- Added the following SVG icons: `HomeIcon`, `AddIcon`, and `SignInIcon`.
- Added stubs for `NewWishlist` and `Wishlists` pages, under the `/new-wishlist` and `/wishlists` paths respectively.


### Code Refactoring

- Renamed `Navbar` component to `Navbars`.
- Refactored the JSX for the top navbar into its own local `TopNavbar` component.
- Refactored SVGs into their own SVG directory in `assets`.
- Refactored the `/signIn` and `/signUp` paths to `/sign-in` and `/sign-up` respectively.
- Other minor refactors.


## [0.0.3] (2024-08-09)

### Features

- Added `Head` component.
- Added `Button` component.
- Added `SecondaryButton` component.
- Added `Container` component.
- Added `Navbar` component.
  - Bottom navbar JSX to be implemented in a future patch.
- Implemented `Head` into existing pages.
- Implemented `Navbar` into App.
- Added `Logo` SVG.
- Added favicons and manifest.
- Added theme color.
- Increased `XL` screen size to `1200px`.


### Code Refactoring

- Extracted most classes in the component layer of `index.css` into their own components.
- Refactored paths to use absolute pathing.


## [0.0.2] (2024-08-07)

### Features

- Added `Work Sans` font.
- Implemented initial CSS structure and Tailwind configuration.
- Implemented color pallet.
- Improve spinner speed and loop background.
- Implemented initial React Router setup.
- Implemented stubs for the `Home`, `SignUp`, and `SignIn` pages.


## [0.0.1] (2024-08-06)

### Features

- Created account tables.
- Created `auth_sessions` table.
- Added `authSessions` module.
- Added `authUtils` module.
- Added account-related constants.
- Added POST `accounts/signUp`.


### Documentation Changes

- Corrected the date in the last patch.


## [0.0.0] (2024-08-06)

### Features

- Initial commit with a rough basic structure and logic.