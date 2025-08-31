# Changelog

## [0.0.14] (2024-08-31)

### Features

- Added `PRIVATE_WISHLIST_PRIVACY_LEVEL`, `FOLLOWERS_WISHLIST_PRIVACY_LEVEL`, `PUBLIC_WISHLIST_PRIVACY_LEVEL`, and `TOTAL_WISHLISTS_LIMIT` to `constants`.
- Added `clientConstants` with the following constants: `PRIVATE_WISHLIST_PRIVACY_LEVEL`, `FOLLOWERS_WISHLIST_PRIVACY_LEVEL`, `PUBLIC_WISHLIST_PRIVACY_LEVEL`.
- Added a `wishlistValidation` module on both the front and back ends.
- Added `created_on_timestamp` to the `wishlists` table.
- Added `authDbHelpers` with `getAccountIdByAuthSessionId()`.
- Added POST `wishlists`.
- Added POST `wishlists/guest`.
- Added `wishlistServices` with `createWishlistAsAccountService()` and `createWishlistAsGuestService()`.
- Added `light` to the color pallette in `tailwind.config.js`.
- Implemented `NewWishlist` page component.


### Changes

- Removed the `description` column in the `wishlists` table.


### Bug Fixes

- Fixed the CORS policy in the development blocking local requests with an undefined origin.


### Code Refactoring

- Refactored `signUpFormValidationReducer` to be a default export.
- Renamed `FormValidationState` interface to `SignUpFormValidationState` in `signUpFormValidationReducer` and stopped it from being exported unnecessarily.
- Split `validation` utility module into detected `userValidation` and `generalValidation` modules, and refactor components accordingly.


## [0.0.13] (2024-08-30)

### Features

- Improved CORS policy in the development environment.
- Added the following page component stubs:
  - `Account`.
  - `Wishlist`.
  - `NewWishlist`.
  - `ViewWishlist`.
- Added the following tables:
  - `wishlists`.
  - `wishlist_items`.
  - `wishlist_item_tags`.
- Added the following router stubs:
  - `wishlistsRouter`.
  - `wishlistItemsRouter`.
  - `wishlistItemTagsRouter`.


### Bug Fixes

- Added missing dependency in the useEffect of `ConfirmAccountVerification`.


### Improvements

- Optimized integer fields throughout the database to better align with the expected data, and added `UNSIGNED` accordingly.


### Code Refactoring

- Refactored routing to align with the newly-added page component stubs and general structure.
- Refactored `VARCHAR()` values throughout the database to better align with the expected data.
- Simplified JON statements by implementing the `USING()` keyword.
- Other minor refactors


## [0.0.12] (2024-08-28)

### Features

- Added `authRouter`.
  - Added GET `auth/session`.
  - Added DELETE `auth/session`.
- Added `authServices`.
  - Added `checkForAuthSessionService()`.
  - Added `signOutService()`.
- Added `AuthContext`, `AuthProvider` and `useAuth()` custom hook.
- Added `keep_signed_in` and `extensions_count` to `auth_sessions` table.
  - These fields are meant to be used by GET `auth/session` to prolong an auth session's lifetime by another day, if it's set to expire within less than 24 hours, for up to 3 extensions.
- Added `ChevronIcon` SVG.
- Added `TopNavbarAccountMenu` and `BottomNavbarAccountMenu` as local components under `Navbars` to be conditionally rendered if the user is signed in.


### Changes

- Changed auth logic to set the `authSessionId` as a session cookie, unless the user wants to stay signed in.


### Code Refactoring

- Redefined a few browser routes.
- Other minor refactors.


## [0.0.11] (2024-08-26)

### Features

- Added `CheckIcon` SVG.
- Added `CheckboxFormGroup` component.
- Implemented `SignIn` page component.
  - Further auth-related features to be added down the line.


### Bug Fixes

- Fixed cron scheduler meant for running every minute running hourly instead.
- Fixed `expectedKeys` in POST `accounts/signIn` not containing `keepSignedIn`. 


### Improvements

- Implement the use of `AbortController` in `ConfirmAccountVerification` component under `AccountVerification` to further tighten the `useEffect` behavior.
  - Added `abortSignal` parameter to `verifyAccountService()`.


### Code Refactoring

- Refactor `accounts/` endpoints to no longer return a `500` if the account deletion fails prior to the response.
- Renamed `removeStaleRateTrackerRows()`to `removeStaleRateTrackerRowsCron()` and added it to `cronInit` to run every minute.


## [0.0.10] (2024-08-25)

### Features

- Added `isValidUuid()` as a utility function in `validation`.
- Added POST `accounts/verification/continue`.
- Added `continueAccountVerificationService()` to `accountServices`.
- Added `AccountVerification` page component, which is comprised of the following local child components:
  - `ContinueAccountVerificationForm`.
  - `ResendAccountVerificationEmail`.
  - `ConfirmAccountVerification`.


### Bug Fixes

- Fixed incorrect CSS class being used for `InfoModal`.
- Fixed `ConfirmModal` and `InfoModal` containers not shrinking, causing visual issues on smaller screens.
- Fixed PATCH `account/verification/resendEmail` and PATCH `account/verification/verify` not rejecting requests when the user is signed in.
- Fixed incorrect validation logic being used in the `rateLimiter()` middleware causing it to always create a new tracking row.
- Fixed `signUpFormValidationReducer` not checking if the user's password and username match before submitting the form.


### Code Refactoring

- Refactored `InfoModal` and `ConfirmModal` to no longer persist through route navigation. 
- Renamed `hideLoadingOverlay()` to `removeLoadingOverlay()`.
- Redefined `/account/verification` path to `/sign-up/verification`.
- Other minor refactors.


## [0.0.9] (2024-08-21)

### Features

- Added `ConfirmModal` component.
- Added `ConfirmModalContext`, `ConfirmModalProvider`, and `useConfirmModal()` custom hook.
- Added `InfoModal` component.
- Added `InfoModalContext`, `InfoModalProvider`, and `useInfoModal()` custom hook.
- Added `EyeShutIcon` SVG.
- Implemented logic to swap between the `EyeIcon` and `EyeShutIcon` SVGs in `PasswordFormGroup` component.


### Bug Fixes

- Fixed `usePopupMessage` hook being called outside of a component.
- Fixed incorrect keyframe name in `PopupMessage.css`.
- Fixed incorrect validation function being used for the password field in `signUpFormValidationReducer`.


### Changes

- Changed the animation for `PopupMessage` to slide up instead.


### Build Changes

- Disabled `@typescript-eslint/no-explicit-any` in `eslint.config.json`.
- Fixed the `globals` npm package causing TypeScript to assume a Node environment, instead of a browser one.


## [0.0.8] (2024-08-19)

### Features

- Added `DefaultFormGroup` component.
- Added `PasswordFormGroup` component.
- Added `validation` utility module.
- Added `signUpService()`.
- Added `resendAccountVerificationEmailService()`.
- Added `verifyAccountService()`.
- Added `signInService()`.
- Added `Providers` and wrapped `App` with it.
- Added `LoadingOverlayContext`, `LoadingOverlayProvider`, and `useLoadingOverlay()` custom hook.
- Improved `signUpFormValidationReducer` and added more action types.
- Added `PopupMessage` component.
- Added `PopupMessageContext`, `PopupMessageProvider`, and `usePopupMessage()` custom hook.
- Added `errorUtils` utility module.
- Implemented sign up logic to `SignUp` page component.


### Bug Fixes

- Fixed logical flaws with the regex in `isValidDisplayName()`.


### Code Refactoring

- Refactored `success` color, and added `popup-danger` color in `tailwind.config.json`.
- Other minor refactors.


### Build Changes

- Added `axios`.


## [0.0.7] (2024-08-15)

### Features

- Added type definitions to connections created for transactions.
- Added `incrementFailedVerificationAttempts()` helper.
- Added PATCH `accounts/verification/verify`.
- Added `incrementVerificationEmailsSent()` helper.
- Added `incrementFailedSignInAttempts()` helper.
- Added `resetFailedSignInAttempts()` helper.
- Added POST `accounts/signIn`.
- Reduced time complexity of finding the oldest auth session in `createAuthSession()` from `O(n log n)` to `O(n)`.
- Added `deleteUnverifiedAccountsCron()`.
- Added `deleteStaleAccountVerificationRequestsCron()`.


### Bug Fixes

- Fixed misalignment between the title and logo in the `Footer` component.
- Fixed verification emails not being sent with the account's public account ID.
- Fixed a few endpoints not calling `logUnexpectedError()` when catching an unexpected error.


### Code Refactoring

- Refactored `accountVerificationEmailTemplate()` to set the origin to `localhost` for development environments.
- Refactored PATCH `accounts/verification/resendEmail` to return a 404 if the account is deleted due to too many failed verification attempts.
- Refactored PATCH `accounts/verification/resendEmail` to return `publicAccountId` on successful responses.
- Refactored `createAuthSession()` to use direct parameters instead of a config object.
- Refactored cron-job functions to receive their timestamp from the scheduler to tighten their behavior.
- Added `Cron` suffix to all cron-job functions.
- Removed unnecessary index definition for `public_account_id` field in `accounts` table, since it's automatically indexed by the `UNIQUE` constraint.
- Other minor refactors.


### Build Changes

- Changed `target` in `tsconfig.json` to `esnext`.


### Documentation Changes

- Added missing patch note in previous patch.


## [0.0.6] (2024-08-14)

### Features

- Added `SignUp_Illustration` SVG.
- Added `JoinMuninnfy` component for `Home` page.
- Added `Footer` component.
- Added `account_preferences` table.
  - Updated POST `accounts/signUp` to insert a row upon account creation.
- Added `accountVerificationEmailTemplate` under `util/emailTemplates/`.
  - Ditched the single-file approach for a more modular one. 
- Implemented `sendAccountVerificationEmail()`.
- Added `public_account_id` field to `accounts` table.
  - Updated POST `accounts/signUp` to align with this change.
- Added `deleteAccountById()` under accountDbHelpers.ts
- Added `description` field to `unexpected_errors` table.
  - Refactored `logUnexpectedError()` to accept an optional `description` parameter to align with this change.
- Added PATCH `accounts/verification/resendEmail`.


### Changes

- Dropped `friend_requests` and `friendships` tables in favour of a follow system, which will be implemented down the line.
- Removed `authUtils`.


### Bug Fixes

- Fixed POST `accounts/signUp` not rolling back the transaction if the user's credentials are taken.


### Code Refactoring

- Renamed `user_id` field in `auth_sessions` table to `account_id`, set it as a foreign key, and set `session_id` as primary key.
- Refactored `generateVerificationCode()` to also exclude the number 0, alongside the letter O, to avoid any user confusion.
- Reworked `isValidAuthSessionId()` as `isValidUuid()` under `tokenGenerator`.
  - Fixed it validating the old structure of an auth session Id in the process.
- Refactored POST `accounts/signUp` to return a `201` instead of `200` as a successful response.
- Refactored imports from `mysql` to `mysql/promise` to prevent type-related inconsistencies.


## [0.0.5] (2024-08-12)

### Features

- Added font files for Italic bold `Work Sans`.
- Added `Hero` component to `Home` page.
- Added `Features` component to `Home` page.
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