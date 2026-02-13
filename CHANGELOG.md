# Changelog

## [0.2.12] (2026-02-13)

### Features

- Implement the use of WebSockets for social-related notifications and live state updates.
  - Added `ws` and `@types/ws` libraries.
  - Added `webSocketHelpers` with `sendWebSocketMessage()`.
  - Added `webSocketConstants` with `WEB_SOCKET_INACTIVITY_THRESHOLD` constant.
  - Added `destroyStaleWebSocketsCron()`.
  - Added `notifications` table.
  - Added `notificationsDbHelpers` with `addNotification()`.
  - Added `notificationTypes` with `NotificationType` and `NotificationDetails`.
  - Added `accountNotificationsWebsSocket`.
- Added optional `includeYear` parameter to `getDateAndTimeString()`.
- Added `NotificationCard` page component.
- Added `notificationsConstants` with `NOTIFICATIONS_FETCH_BATCH_SIZE`.
- Added `notificationsRouter`.
- Added GET `notifications/:offset`.
- Added `notificationServices` with `getNotificationsBatchService()`.
- Added `AccountNotificationsContext`, `AccountNotificationsProvider`, and `useAccountNotifications` custom hook.
- Added useAccountNotificationsWebsocket custom hook.
- Added `notificationsConstants` with `NOTIFICATIONS_FETCH_BATCH_SIZE` and `NOTIFICATIONS_RENDER_BATCH_SIZE`.
- Completed `AccountNotifications` implementation.


### Code Refactoring

- Minor consistency-related refactors.
- Minor simplification to the structure of returned data in social endpoints.


## [0.2.11] (2026-02-02)

### Features

- Added optional `placeholder` prop for `DefaultFormGroup`.
- Added the following validation functions:
  - `isValidSocialFindQuery()`.
  - `validateSocialFindQuery()`.
- Added GET `social/find/:searchQuery`.
- Added `findAccountService()`.
- implement `AccountSocialFindAccount`.
- Added optional `cardsCount` to `ContentLoadingSkeleton` prop to allow for a dynamic number of cards to be rendered.


### Improvements

- Consolidated social fetching services into `getSocialBatchService()`.
- Consolidated social query services to `searchSocialService()`.
- Added `@` symbol before usernames in `FollowCard` and `FollowRequestCard` to visually differentiate it from the display name.
- Added a placeholder for the search bar in `AccountSocialFollowers`, `AccountSocialFollowing`, and `AccountSocialFollowRequests`.


### Bug Fixes

- Fixed edge case causing infinite loading until user intervention when cancelling an HTTP request by emptying the search query in `AccountSocialFollowers`, `AccountSocialFollowing`, and `AccountSocialFollowRequests`.
- Fixed `FollowCard` and `FollowRequestCard` components not being removed when displaying the results of a search query.
- Fixed and edge case causing an additional fetch requests for social data despite already having fetched it all in `AccountSocialFollowers`, `AccountSocialFollowing`, and `AccountSocialFollowRequests`.


### Code Refactoring

- Renamed `SocialType` type to `SocialSectionType` and move it to `socialTypes`.
- Renamed `AccountDetails` type to `FindAccountDetails` and exported it.
- Improved padding consistency for CASE statements.


## [0.2.10] (2026-01-26)

### Features

- Added the following services:
  - `searchFollowersService()`.
  - `searchFollowingService()`.
  - `searchFollowRequestsService()`.
- Added `SOCIAL_RENDER_BATCH_SIZE` constant.
- Implemented the following components, completing the Social section:
  `AccountSocialFollowers()`.
  `AccountSocialFollowing()`.
  `AccountSocialFollowRequests()`.


### Improvements

- Reduced restrictions on search query validation.
- Memoized `FollowCard` and `FollowRequestCard`.
- Improved typing related to social services.


### Bug Fixes

- Fixed followers, following, and follow requests counts being incorrectly calculated and displayed.
- Fixed `socialCounts` not being updated when a user is unfollowed or removed as a follower.
- Fixed searchFollowRequestsService() using an incorrect return type.
- Fixed `socialCounts` not being updated accordingly in `FollowRequestCard`.


### Code Refactoring

- Added `containsInvalidWhitespace()` and implemented it to improve readability in a few validation functions.
- Renamed some debouncing functions for consistency.
- Implement the use of params for query-string-based axios services.


## [0.2.9] (2026-01-07)

### Features

- Added the following endpoints:
  - GET `social/followers/:offset`.
  - GET `social/following/:offset`.
  - GET `social/followRequests/:offset`.
  - GET `social/followers/search`.
  - GET `social/following/search`.
  - GET `social/followRequests/search`.
- Added the following services:
  - `getFollowersBatchService()`.
  - `getFollowingBatchService()`.
  - `getFollowRequestsBatchService()`.
- Implement account link copy logic.
- Added state to track fetch status in `AccountSocialDetailsContext`.
- Added `socialValidation` with `isValidSocialQuery()`.


### Bug Fixes

- Fixed `AccountSocialDetailsProvider` being in the wrong location, causing a fetch every time the user navigated to the section.


### Code Refactoring

- simplify data types in GET `social`.
- Remove double logging in some instances of using helper functions.


### Documentation Changes

- Fixed incorrect 2024 being used instead of 2025 since the first patch.


## [0.2.8] (2025-12-31)

### Features

- Added the following constants:
  - `ACCOUNT_MAX_FOLLOWERS_LIMIT`.
  - `ACCOUNT_MAX_FOLLOWING_LIMIT`.
  - `SOCIAL_FETCH_BATCH_SIZE` under `socialConstants` on the front end.
- Added `deleteStaleFollowRequestsCron()` cron job to run every 6 hours, removing follow requests 7 weeks or older. 


### Changes

- Increased `ACCOUNT_SOCIAL_FETCH_BATCH_SIZE` to 100.
- Reworked the following endpoints to account for the new maximum following and followers limits:
  - POST `accounts/followRequests/send`.
  - POST `accounts/followRequests/accept`.
    - NOTE: endpoint paths above have been reworked with this patch. See improvements below.


### Improvements

- Separated account-related and social-related endpoints and logic for better maintainability.
  - All social-related logic now goes through the `/api/social` endpoint prefix, and is handled by the newly-added `socialRouter`.
  - Constants, types, helpers, cron jobs, utility functions, and modules have been separated.
  - Plenty of refactoring went into this, introducing new modules in the process.


### Bug Fixes

- Added missing `useEffect` dependency array in `AccountSocial`.


## [0.2.7] (2025-12-30)

### Features

- Added the following social functionality:
  - Unfollow.
  - Remove follower
  - Accept follow requests.
  - Decline follow requests.
- Added the following components:
  - `AccountSocialHeader`.
  - `FollowCard`.
  - `FollowRequestCard`.
  - `ContentLoadingSkeleton`.
  - `AccountSocialFollowers`.
  - `AccountSocialFollowing`.
  - `AccountSocialFollowRequests`.
  - `AccountSocialFindAccount`.
- Added `AccountSocialContext`, `AccountSocialProvider`, and `useAccountSocial()` custom hook.
- Added `AccountSocialDetailsContext` and `AccountSocialDetailsProvider` and `useAccountSocialDetails()` custom hook.
- Added `SocialData`, `FollowDetails`, and `FollowRequest` types.
- Added `ACCOUNT_SOCIAL_FETCH_BATCH_SIZE` constant.
- Added the following services:
  - `getAccountSocialDetailsService()`.
  - `unfollowService()`.
  - `removeFollowerService()`.
  - `acceptFollowRequestService()`.
  - `declineFollowRequestService()`.
- Added GET `accounts/social`.
- Added `deleteFollowRequest()` helper.
- Added `RemoveIcon` SVG.


### Bug Fixes

- Fixed POST `accounts/followRequests/accept` not deleting follow requests if the requester is already following.


### Code Refactoring

- Minor refactors.


## [0.2.6] (2025-12-25)

### Features

- Added the following tables:
  - `follow_requests`.
  - `followers`.
- Added the following endpoints:
  - POST `accounts/followRequests/send`.
  - DELETE `accounts/followRequests/cancel/:requestId`.
  - POST `accounts/followRequests/accept`.
  - DELETE `accounts/followRequests/decline/:requestId`.
  - DELETE `accounts/followers/unfollow/:followId`.
  - DELETE `accounts/followers/remove/:followId`.


### Bug Fixes

- Fixed `null` being used instead of `err` when using `logUnexpectedError()` to log attempts of sending two responses..


### Code Refactoring

- Removed unused `App.css` file.


## [0.2.5] (2025-12-21)

### Features

- Fully implemented the profile section in `Account`, which allows the user to:
  - Change their account's privacy settings.
  - Change their display name.
  - Change their password.
  - Change their email address.
  - Delete their account.
- Added `AccountOngoingRequestsContext`, `AccountOngoingRequestsProvider`, and `useAccountOngoingRequests()` custom hook.
- Added `AccountProfileContext`, `AccountProfileProvider`, and `useAccountProfile()` custom hook.
- Added the following components under `Account`:
  - `AccountChangeDisplayName`.
  - `AccountChangePassword`.
  - `AccountOngoingRequests`.
  - `AccountChangeEmail`.
    - `AccountChangeEmailStart`.
    - `AccountChangeEmailSuspended`.
    - `AccountChangeEmailConfirm`.
  - `AccountDeletion`.
    - `AccountDeletionStart`.
    - `AccountDeletionSuspended`.
    - `AccountDeletionConfirm`.
- Added `AccountProfileUtils` with `isValidOngoingRequestData()` and `resDataContainsExpiryTimestamp()`.


### Changes

- Reworked confirmation codes to now be cryptographically safe 8-digit hexadecimal codes.


### Improvements

- Visually aligned the logo phrase in the footer with the rest of the footer elements.
- Improved privacy related phrasing.
- Other minor improvements.


### Bug Fixes

- Fixed `setAccountDetails()` incorrectly updating the `approve_follow_requests` value.
- Fixed `StatisticItem` components overlaying the header's context menu.
- Fixed longer emails not breaking into a new line in the profile header.
- Fixed `AccountDetailsContext` being named `AccountContext`.
- Fixed 404 responses for accounts not being found not removing the `authSessionId` cookie.
- Fixed incorrect error reason in POST `accounts/details/email/start`.
- Fixed a number of logical flaws in PATCH `accounts/details/email/confirm` and DELETE `accounts//deletion/confirm/:confirmationCode`.


### Code Refactoring

- Renamed `section` and `setSection` to `profileSection` and `setProfileSection` respectively for `AccountProfileContext`.
- Refactored GET `accounts` to include ongoing requests data.
- Simplified instanced of `isSubmitBtn={true}` to `isSubmitBtn`.
- Reordered the buttons in the profile header context menu to be more intuitive.
- Refactored email subject for `sendEmailUpdateStartEmailService()`.
- Reworked `suspendAccountRequest()` to return the new expiry timestamp, which will now be returned in the response.
- Reduced unnecessarily long error message in some endpoints
- Plenty of other minor refactors.


### Build Changes

- Improved `eslint.config.js`.


## [0.2.4] (2025-12-14)

### Features

- Added the following endpoints:
  - PATCH `accounts/recovery/confirm`.
  - POST `accounts/deletion/start`.
  - PATCH `accounts/deletion/resendEmail`.
  - DELETE `accounts/deletion/confirm/:confirmationCode`.
- Added the following helpers:
  - `incrementAccountRequestEmailsSent`.
  - `incrementFailedAccountRequestAttempts`.
  - `suspendAccountRequest`.
- Added `deleteStaleAccountRecoveryRequestsCron()`.
- Added `deleteStaleAccountDeletionRequestsCron()`.
- Added `accountDeletionEmailTemplate`.
- Added `sendAccountDeletionEmailService()`.


### Changes

- `logUnexpectedError()` can now accept `null` for the `req` parameter.


### Improvements

- Majorly reduced redundancy, and improved readability, for account-related change endpoints and logic, changing the row names in a few tables in the process.


### Bug Fixes

- Fixed error logging issues throughout the app.
- Fixed a few issues with the use of the use of transactions throughout the app, improving the overall logic in the process.
- Fixed `extensions_count` not being reset when the oldest auth session is repurposed in `createAuthSession()`.


### Code Refactoring

- Refactored removed redundant `failed_sign_in_attempts` checks in `accountsRouter`.
- Refactored renamed `WISHLIST_INTERACTION_MAX_VALUE` to `WISHLIST_INTERACTIVITY_MAX_VALUE`.
- Refactored removed redundant logging.
- Other minor refactors related to the improvements in this patch.


## [0.2.3] (2025-12-08)

### Features

- Added the following endpoints:
  - PATCH `accounts/recovery/resendEmail`.
  - POST `accounts/recovery/start`.
  - PATCH `accounts/details/password`.
  - PATCH `accounts/details/email/confirm`.
- Added the following helpers:
  - `incrementRecoveryEmailsSent()`.
  - `suspendEmailUpdateRequest()`
- Added `deleteStaleEmailUpdateRequestsCron()`.
- Added `ACCOUNT_EMAIL_UPDATE_SUSPENSION_DURATION` to `accountConstants`.
- Successful sign in attempts now remove any ongoing account recovery requests.
- Added `accountRecoveryEmailTemplate` with `accountRecoveryEmailTemplate()`.
- Added `sendAccountRecoveryEmailService()`.
- Added optional `authSessionIdToExclude` parameter to `purgeAuthSessions()`.


### Changes

- Reduced `ACCOUNT_EMAIL_UPDATE_WINDOW` to an hour down from a day.


### Improvements

- Improved database transaction logic throughout the app, fixing a few issues in the process.


### Bug Fixes

- fixed grammar inconsistency with `logUnexpectedError()` in a few locations.
- fixed `logUnexpectedError()` being called before sending a response.
- fixed POST `accounts/details/email/start` not handling duplicate new_email in the catch block.
- fixed POST `accounts/details/email/start` not accounting for suspended requests.
- fixed incorrect parameter name in `incrementedFailedEmailChangeAttempts()`.
- fixed rename `incrementEmailChangeEmailsSent()` and `incrementedFailedEmailChangeAttempts()` to `incrementEmailUpdateEmailsSent()` and `incrementedFailedEmailUpdateAttempts()` respectively.
- fixed `@types/cookie-parser` not being listed as a dev dependency.


### Code Refactoring

Renamed `useAsyncErrorHandler` to `useHandleAsyncError`.
Rephrased `emailsLimitReached` to `emailsSentLimitReached` in a few endpoints.
Improved readability of some SQL queries by adding line breaks.
Consolidated suspension constants into one in `accountConstants`.


## [0.2.2] (2025-12-04)

### Features

- Implement general structure, navigation, and some of the profile section in `Account`.
- Added the following components under the `Account` page:
  - `AccountContent`.
  - `AccountNavMenu`.
  - `AccountSidebar`.
    - `AccountSidebarButton`.
  - `AccountProfile`.
    - `AccountProfileHeader`.
    - `AccountProfilePrivacy`.
  - `AccountSocial`.
  - `AccountNotification`.
  - `AccountWishlists`.
- Added `AccountLocationContext`, `AccountLocationProvider` and `useAccountLocation` custom hook.
- Added `AccountDetailsContext`, `AccountDetailsProvider` and `useAccountDetails` custom hook.
- Added the following endpoints:
  - PATCH `details/privacy`.
  - PATCH `details/displayName`.
  - POST `details/email/start`.
  - PATCH `details/email/resendEmail`.
- Added the following services under `accountServices`:
  - `getAccountDetailsService()`.
  - `updateAccountPrivacyService()`.
  - `updateAccountDisplayNameService()`.
- Added `HamMenuIcon` SVG.
- Added `emailUpdateStartEmailTemplate`.
- Added `handleIncorrectPassword()` and implemented it accordingly.
- Added the following helpers under `accountDbHelpers`:
  - `incrementEmailChangeEmailsSent()`.
  - `incrementedFailedEmailChangeAttempts()`.


### Changes

- Reworked GET `accounts` to align with recent changes
  - Endpoint will be reworked further as more features are implemented.


### Improvements

- Added `sendEmailService()` locally in `emailServices`, refactoring the logic in the process to improve readability and reduce repeatability.
- Improve typing for `emailServices`, `accountVerificationEmailTemplate`, and `emailChangeStartEmailTemplate`.
- Improve parameter naming in `authSessions`.


### Bug Fixes

- Fixed POST `accounts/signUp` not checking if the email is used in the `email_update` table.
- Fixed time remaining not being floored in `accountVerificationEmailTemplate`.
- Fix `Readonly` being incorrectly used in `incrementVerificationEmailsSent()`.


### Code Refactoring

- Renamed `sendAccountVerificationEmail()` to `sendAccountVerificationEmailService()`.
- Renamed `emailUpdateStartEmailTemplate` to `emailChangeStartEmailTemplate`.
- Removed unused `<title>` tags in the HTML `<head>` in `accountVerificationEmailTemplate` and `emailChangeStartEmailTemplate`.
- Renamed `generateVerificationCode()` and `isValidVerificationCode()` to `generateConfirmationCode()` and `isValidConfirmationCode()` respectively.


## [0.2.1] (2025-11-25)

### Features

- Added wishlist interactivity tracking.
  - Added `latest_interaction_timestamp` and `interactivity_index` to `wishlists` table.
  - Added `decayWishlistsInteractivityIndexCron()` cron job which runs every 6 hours.
  - Added the following interactivity-related constants: `WISHLIST_INTERACTION_MAX_VALUE`, `WISHLIST_INTERACTION_CREATE`, `WISHLIST_INTERACTION_ADD_ITEM`, `WISHLIST_INTERACTION_GENERAL`, `WISHLIST_INTERACTION_BULK_SMALL`, `WISHLIST_INTERACTION_BULK_LARGE`, `WISHLIST_INTERACTION_BULK_BORDER`, `WISHLIST_INTERACTION_THROTTLE_WINDOW`, `WISHLIST_INTERACTIVITY_DECAY_AMOUNT`, `WISHLIST_INTERACTIVITY_DECAY_GRACE_PERIOD`.
  - Added `incrementInteractivityIndex()` helper.
  - Refactored a number of endpoints to implement this accordingly.
  - Added the option to sort wishlists by interactivity, and made it the default sorting mode.
- Added the option to favorite a wishlist.
  - Added `is_favorited` column to `wishlists` table.
  - Added PATCH `wishlists/change/favorite`.
  - Added option to filter wishlists by whether or not they're favorited.
  - Added `HeartIcon` SVG.
  - Added an indicator when a wishlist is favorited.


### Improvements

- `NewWishlist` page will now be removed from the navigation history if a wishlist is successfully created, improving the user experience.


### Code Refactoring

- Removed `wishlistsItemsTagsRouter` and `wishlistItemTagsService`, which were unused.


### Bug Fixes

- Fixed the total wishlists counts being incorrectly passed around to components, causing them to no rerender, and for it to not be updated. 


## [0.2.0] (2025-11-21)

### Features

- `Wishlists` page implementation completed.
- Added `StatisticItem` component, and implemented it in `WishlistCard` and `WishlistHeader`.
- Added `WishlistsHeader` page component.
  - GET `wishlists/all` has been adjusted to return `combinedWishlistsStatistics` object.
  - `StatisticItem` was implemented here as well.
- Added `ArrowIcon` SVG.
- Improve UI design of `WishlistCard`.
- Added an indicator, for both `WishlistsContainer` and `WishlistItems`, showing how many wishlists or items passed the applied filters.
  - The indicator for applied filters, previously in `WishlistsToolbar` and `WishlistItemsToolbar` respectively, have been moved in this change.


### Improvements

- Added a loading overlay while a request to delete empty wishlists is being handled.


### Bug Fixes

- Fixed "Cost to purchase" value for selected wishlist items in `bulkSetWishlistItemIsPurchased` not being formatted to with thousands separators.
- Fixed a few typos.


## [0.1.5] (2025-11-18)

### Features

- Implemented most of the `Wishlists` page.
- Added `WishlistsContext`, `WishlistsProvider`, and `useWishlists()` custom hook.
- Added the following components:
  - `WishlistsContainer`.
  - `WishlistsToolbarView`.
  - `WishlistsToolbarSort`.
  - `WishlistToolbarOptions`.
  - `PriceRangeFormGroup`.
  - `WishlistsToolbarFilters`.
  - `WishlistsItemsCountRange`.
  - `WishlistsFilterToggler`.
- Added the following endpoints:
  - DELETE `wishlists/empty`.
  - GET `wishlists/crossWishlistSearch/:itemTitleQuery`.
- Added the following services:
  - `deleteEmptyWishlistsService()`.
  - `crossWishlistSearchService()`.
- Added `sharedValidation` module.
- Added the following constants:
  - `WISHLIST_ITEMS_LIMIT`.
  - `WISHLIST_MAX_PRICE_TO_COMPLETE`.


### Improvements

- Memoized `WishlistCard`.
- Slightly tightened usage of `handleAsyncError()`.


### Bug Fixes

- Fixed changing an item's price from 0 to none not registering as a change in `WishlistItemForm`, preventing the user form removing the price attribute from an item while editing it


### Code Refactoring

- Locale is not explicitly set to `en` `sortWishlistItems()` in `WishlistItemsProvider`.
- Fixed `itemMatchesFilterConfig()` in `WishlistItemsProvider` not checking explicitly for null values in a few conditions.
- Added missing `initialWishlists` in the component's props.
- Simplified `WishlistCard` props.
- Fixed `RedirectIcon` having a higher `z-index` than the link in `WishlistCard`.
- Fixed aborted requests setting the auth status to `unauthenticated`, leading to flickers and unexpected behavior.
  - This issue mostly occurred in the development environment, but had the potential to impact production.
- Fixed grammar mistakes in `Features`.
- Fixed UI alignment issues in `WishlistHeaderContent`. 
- Fixed phrasing issues in `validateWishlistItemPrice()`.


## [0.1.4] (2025-11-08)

### Features

- Added the following endpoints:
  - GET `accounts`.
  - GET `wishlists/all`.
- Added the following components:
  - `WishlistPrivacyLevelIcon`.
  - `WishlistCard`.
- Added the following SVGs:
  - `LockIcon`.
  - `PersonIcon`.
  - `RedirectIcon`.
- Added `WISHLIST_FETCH_BATCH_SIZE` to to both `wishlistConstants` modules.
- Added `getAllWishlistsService()`.
- Implement fetching for `Wishlists`.


### Improvements

- Redesigned UI for `WishlistHeader`, improving visuals and displaying the total number of wishlist items.


### Changes

- Reduced wishlists limit per user to 100.


### Bug Fixes

- Fixed text wrapping and breaking issues in `WishlistItem` and `WishlistHeaderContent`.


### Code Refactoring

- Minor refactors to variable and type naming.
- Other minor refactors.


### Chore Changes

- Audited packages.


## [0.1.3] (2025-10-31)

### Features

- Added "Cost to complete" information in `WishlistHeader`.
- Added "Cost to purchase" information in `WishlistItemsSelectionContainer`, conveying the cost of purchasing selected items.
- Added an indicator for the user to show if, and how many, filters are applied.
- Added the option to require all the filter tags.
  - By default, any item containing at least one of the filter tags is included in the results. Checking "Require all tags" would only allow wishlist items that include all the filter tags to be shown in the results.


### Improvements

- Newly added wishlist items will be expanded by default if all other items are expanded when its added, improving user experience.
- Reworked UI look and structure of `WishlistItemsToolbarFilters`, making it more intuitive and easier to use.
  - This included UI improvements to `ToggleSwitch`.


### Bug Fixes

- Fixed price range filtering issues caused by a typo using the wrong variable in `WishlistItemToolbarPriceRange`.


### Code Refactoring

- Minor margin adjustments in `DeleteWishlistForm` and `WishlistHeaderContent`.
- Renamed `ItemsFilterConfig` type to `ItemsFilterConfigType` for better clarity.


## [0.1.2] (2025-10-29)

### Features

- Added `zustand`.
- Wishlist items now store the purchase date.
  - Implemented purchase date filtering.
- Wishlist items now allow an optional `price` property.
  - Implemented price filtering and sorting.
  - Added `WishlistItemToolbarPriceRange`.


### Improvements

- Abolished the use of `useEffect` in `WishlistItemsProvider` to sort items when the sorting mode is changed to avoid an extra rerender.
- Reworked `wishlistItemsExpansionStore` and `wishlistItemsSelectionStore` with `zustand`.
- Removed a few unnecessary uses of `useMemo`.
- Improved phrasing of required and optional fields in `WishlistItemForm`.
- Improved phrasing of label  or `WishlistItemTagsFormGroup`.
- Improve phrasing of sorting options.
- Improved the look and proportion of `ToggleSwitch`.


### Bug Fixes

- Fixed manual sorting being used in `handleDuplicateItemTitle()` instead of calling `sortWishlistItems()` in `EditPrivacyLevelContainer`.
- Removed leftover type exports in `WishlistContext` being used in `WishlistItemsToolbarSort`.
- Fixed `z-index` in `WishlistItemsToolbar` to prevent elements blocking context menus.
- Fixed wishlist items not being resorted when an item is updated.


### Code Refactoring

- Refactored out unnecessary `.Provider` calls in providers throughout the app.
- Refactored out unnecessary cloning of the tags array in `setWishlistItems()` call in `WishlistItemButtonContainer`.
- Refactored collapse button in `EditPrivacyLevelContainer`to better fit the surrounding UI.


## [0.1.1] (2025-10-22)

### Improvements

- Improve a number of render-related performance issues throughout `Wishlist`.
  - This included splitting the context into `WishlistContext` and `WishlistItemsContext`, as well as adding `wishlistItemsExpansionStore` and `wishlistItemsSelectionStore`.
  - Further improvements or refinements may be implemented down the line.


### Bug Fixes

- Fixed PATCH `wishlists/change/title` not checking, or account, for duplicate titles.
  - Added missing handling for duplicate titles in `EditWishlistTitleForm`.


## [0.1.0] (2025-10-16)

### Features

- Implemented bulk action logic for wishlist items, thus completing all the main features for the `Wishlist` page.
- Added the following endpoints:
  - DELETE `wishlistItems/bulk`.
  - PATCH `wishlistItems/purchaseSTatus/bulk`.
- Added the following services in `wishlistItemServices`:
  - `bulkDeleteWishlistItemsService()`.
  - `bulkSetWishlistItemIsPurchasedService()`.
- Added a popup message when the wishlist items column view is changed.
- Added a popup message when all wishlist items are expanded or collapsed.


### Improvements

- Updating or resetting wishlist filters now resets the selected items.
- Added subtle gradient to the header in `NewWishlistItemFormContainer` to improve visual separation.
- Split `wishlistViewConfig` state in `WishlistContext` and `WishlistProvider`:
  - Renamed `isSingleColumnGrid` and `setIsSingleColumnGrid` to `isSingleColumnView` and `setIsSingleColumnView`.
  - Replace `expandAllWishlistItems` and `expandAllWishlistItems` with `expandedItemsSet` and `setExpandedItemsSet`, to handle wishlist item expansion logic and address all the flaws with the previous implementing.


### Bug Fixes

- Fixed `removeRequestCookie()` being called after a response is sent in `authDbHelpers`.
- Fixed `await connection.rollback();` not being called before a response is sent in a few endpoints.
- Fixed a few 500 error responses not logging errors in a number of endpoints.
- Fixed `ConfirmModal` not being removed before `bulkDeleteWishlistItems()` is called.
- Fixed "Select all items" button not accounting for any active filters.
- Fixed "Select all items" button being checked when there aren't any items in the wishlist.
- Fixed header in `NewWishlistItemFormContainer` not having rounded corners on the top when expanded.
- Fixed `ChevronIcon` not rotating upon item expansion in `WishlistItem`.


### Code Refactoring

- Renamed `bulkUpdateWishlistItemIsPurchased()` (stub) to `bulkSetWishlistItemIsPurchased()`.
- Simplified how `itemMatchesFilterConfig()` is passed to a `.filter()` call in `WishlistItem` and `WishlistItemsSelectionContainer`.


## [0.0.29] (2025-10-13)

### Features

- Implemented selection state and logic to wishlists
  - Bulk update and delete actions to be implemented in a future patch. 


### Code Refactoring

- Refactored out the usage of `Logo` SVG in favour of `CrossIcon` to reduce bundle size.


## [0.0.28] (2025-10-11)

### Features

- Implemented sorting functionality for wishlist items.
  - Lexicographic sorting is referred to as "alphabetical" as far as the user is concerned to avoid confusing jargon.
- Implemented functionality to expand or collapse all wishlist items.
  - Feature has a few flaws. An improvement or a full rework is planned down the line.
- Implemented explicit lexicographic sorting for wishlist item tags.


### Changes

- Removed accidental tag deletion protection.
  - This was meant to prevent the user from accidentally removing a tag when trying to delete text of a would-be tag, but the behavior was unintuitive for users.


### Improvements

- Improved quality and consistency of `title` and `aria-label` attributes throughout the app.


### Bug Fixes

- Fixed both labels in `TimeWindowContainer` aiming at the first input.
- Added missing `useEffect` cleanup functions in `ConfirmModal` and `InfoModal`.


### Code Refactoring

- Removed leftover, unused local component from `WishlistItemTagsFormGroup`.
- Refactor `e: FormEvent<HTMLFormElement>` to `e: FormEvent` as it was overly verbose.


## [0.0.27] (2025-10-08)

### Features

- Added loading spinner and logic to `WishlistItems`.
  - This is only meant for potentially heavy filtering. Normally, filtering will near instant.
- Added `debounce` utility module.
- Implement search query logic in `WishlistItemsToolbar`.
- Added `isSingleColumnGrid` and `setIsSingleColumnGrid()` to `WishlistContext`.
- Implemented `WishlistItemsToolbarView`.


### Bug Fixes

- Fixed `itemMatchesFilterConfig()` in `WishlistProvider` not converting the item's title to lowercase before comparing.


### Code Refactoring

- Renamed `loadingWishlistItems` and `setLoadingWishlistItems()` to `wishlistItemsLoading` and `setWishlistItemsLoading()`.
- Fixed grid view button in `WishlistItemsToolbarView` not being hidden on smaller screens, where a double-column view is not allowed.
- Fixed main `WishlistItemsToolbar` buttons not having `title` and `aria-label` attributes.


## [0.0.26] (2025-10-06)

### Features

- Added `CrossIcon` SVG.
- Added `TimeWindowContainer` component.
- Implement `WishlistItemsToolbarFilters` functionality.


### Changes

- Changed `addWishlistItem()` in `WishlistItemsForm` to not collapse the form after a successful submission.
  - This is meant to streamline the process of adding multiple items quickly.


### Improvements

- Slightly improved the UI for `TimeWindowContainer`.
- Memoized `WishlistItem`.
- Memoized `filteredItems` in `WishlistItems`.


### Bug Fixes

- Fixed the current year, month, and date in `Calendar` not being highlighted following the refactors in previous patches.
- Fixed `Calendar` allowing conflicting start and end timestamps (start timestamps being after end timestamps and vice versa).
  - If two conflicting timestamps are detected, the timestamp being added is kept, while the existing timestamp is disregarded.
- Fixed date text overflowing in `Calendar` on screens sizes below 340 pixels.
- Fixed inconsistencies in border colors for inputs and input-shaped elements.
- Fixed a number of logical issues with `itemsMatchesFilterConfig()` under `WishlistProvider`.


### Code Refactoring

- Moved onClick handlers in `Calendar` to dedicated functions for better readability.
- Removed unnecessary `!important` tailwind declarations in a few spots.


## [0.0.25] (2025-10-04)

### Features

- Implement custom typecasting function in `db` to convert all `TINYINT(1)` fetched by `mysql2` to JS booleans.
- Added filtering state and function to `WishlistContext`.
- Added `NavbarAccountMenu` component to factor out the duplication in `TopNavbar` and `BottomNavbar`.
- Added `WishlistItemButtonContainer` component, extracting the button container from `WishlistItem`, to improve readability and maintainability.


### Improvements

- Reworked all styling to be tailwind-first, effectively eliminating all CSS files except for `index`.
  - This change was done over multiple commits and included plenty of refactors.
- Improved `onBlur` handler logic. 


### Changes

- Added a confirmation step before deleting a single wishlist item.


### Bug Fixes

- Removed unnecessary inefficiency and complexity in creating `wishlistItemsTitleSet` in `WishlistProvider`.
- Fixed some components not having a default export.
- Fixed short-circuiting being incorrectly used in some locations to determine an element's className.
- Fixed UI issues with `WishlistItem` created in the last patch. 
- Fixed clicking the `Share wishlist` button not closing the context menu.
- Fixed a few instances where tailwind's `transition-` property wasn't correctly used.
- Fixed `ConfirmModal` and `InfoModal` not correctly handling how long words should overflow.


### Code Refactoring

- Split all different form group components into their own dedicated directory in the app's `components` directory.
- Refactored all components to have a dedicated prop object type definition for better readability.
- Removed overly-verbose function return type definitions.


### Build Changes

- Added `eqeqeq` to `eslint.config.js`.


## [0.0.24] (2025-09-29)

### Features

- Added `SingleColumnGridIcon`, `DoubleColumnGridIcon`, `SortIcon` SVGs.
- Added the following component stubs:
  - `WishlistItemsToolbar`.
  - `WishlistItemsToolbarOptions`.
  - `WishlistItemsToolbarSort`.
  - `WishlistItemsToolbarView`.
  - `WishlistItemsToolbarFilters`.
  - `WishlistItemsToolbarFilterItem`.
- Added `CalendarContext`, `CalendarProvider`, and `useCalendar` custom hook.
- Added `Calendar` component, leveraging `CalendarContext`.
- Added `ToggleSwitch` component.


### Bug Fixes

- Fixed `rateLimitReached()` not correctly handling the difference between users going beyond the rate limit and abuse threshold.


### Code Refactoring

- Improved overall structure under the `Wishlist` page directory.
- Improved component styling for components under the `Wishlist` page directory. 


## [0.0.23] (2025-09-24)

### Features

- Implemented logic to rendering when there are no wishlist items in `WishlistItems`.
- Implemented logic to focus the title input in `WishlistItemForm` on mount, but only when adding a new item.
  - This is meant to streamline the user's experience, as a title is always required, whereas they might want to change something else when editing an item.
- Added `ABUSE_INCREMENT_THRESHOLD` constant.
- Added `useAsyncErrorHandler` custom hook.
  - This hook is meant to improve how async error data is extracted, leveraging `getAsyncErrorData()`, while also handling common, component-agnostic errors.
  - Refactored relevant components to use this hook.
- Added `wishlistTypes` under the `types` directory, and moved `WishlistDetailsType` to it.
- Added `wishlistItemTypes` under the `types` directory, and moved `WishlistItemType` to it.


### Improvements

- Improved the header in `NewWishlistItemFormContainer`.
- A number of small improvements to the UI in `Wishlist`.
- Improved variable naming in `WishlistItem`, `WishlistItems`, and `WishlistItemForm`.
- Improved rate-limiting logic to allow for a grace window of 10 requests beyond the rate limit in place before adding an IP address to the `abusive_users` table.


### Changes

- Changed all interfaces to types throughout the app.
  - Interfaces with names ending with `Interface` were updated to end with `Type`.
  - This change has no effect on any of the app's logic. It's purely meant for consistency and to prevent the potential for unwanted declaration merging.


### Bug Fixes

- Fixed logical flaw in one of the if-statement under PATCH `wishlistItemsRouter`, causing tags to not be updated if the number of, either existing or new tags, is 0.
- Added missing cleanup function for the `useEffect` in `WishlistItemForm`.


### Code Refactoring

- Moved `SqlError` interface from `global.d.ts` to `isSqlError`, and simplified relevant code to no longer need the interface explicitly, which is no longer exported.
- Changed PATCH `wishlists/change/privacyLevel` to return a 200 response if the privacy level requests is already set to the wishlist, simplifying client-side handling.
- Improved handling of 400 errors throughout.
- Refactored `AccountVerification` by moving its local components into their own dedicated files:
  - `ContinueAccountVerification`.
  - `ResendAccountVerificationEmail`.
  - `ConfirmAccountVerification`.


## [0.0.22] (2025-09-21)

### Features

- Added `deleteExpiredAuthSessionsCron()` and scheduled it to run every minute.
- Added `authUtils` with `getAuthSessionId()`.
  - Refactored a number of endpoints to use this function to improve readability and reduce repetition.
- Added the following endpoints:
  - DELETE `wishlistItems`.
  - PATCH `wishlistItems/purchaseStatus`.
- Added the following services:
  - `deleteWishlistItemService()`.
  - `setWishlistItemIsPurchasedService()`.
- Completed implementation of `WishlistItem`.
  - Logic for deleting items, and marking them as purchased, implemented with tiny UI improvements.


### Changes

- Updated GET `wishlists/:wishlistId`, and corresponding client-side logic, to sort wishlist items by `added_on_timestamp` with the newest items being first.
- Increased the lifespan of `unexpected_errors` table rows from 2 to 7 days.


### Bug Fixes

- Fixed `validateItemTag()` in `WishlistItemTagsFormGroup` not relaying to the user the maximum tag length.
- Fixed POST `wishlistItemTags` not validating the wishlist ID.
  - This endpoint will likely end up being removed, as a different approach for managing tags has since been implemented, but it will stay for now.
- Fixed `getAccountIdByAuthSessionId()` not removing the authSessionId cookie when the auth session is invalid.
- Added missing `title` and `aria-label` attributes to the wishlist header context menu button.
- Fixed wishlist header editing container not being collapsed after the privacy level is successfully updated.
- Fixed `addToAbusiveUsers()` not accounting for undefined ip addresses.
  - This is not relevant for production environments.


### Code Refactoring

- Refactored endpoints to always destructure the request body to improve readability.
- Refactored how mysql2 queries are typed to now use casting carefully, instead of extending `RowDataPacket`.
  - Previous approach failed to flag attempts to access a property that's not defined in the query's interface due to `RowDataPacket`'s interface.
- Rename both `globals.d.ts` files to `global.d.ts`, and moved them into the type directory.
- Removed fullstops from some `title` and `aria-label` attributes to ensure consistency.


## [0.0.21] (2025-09-19)

### Features

- Added `getShortenedDateString()` to `globalUtils`.
- Added `WishlistItems` and `WishlistItem` components (mostly implemented).
- Added `wishlistItemTagsDbHelpers` with `insertWishlistItemTags()` and `deleteWishlistItemTags()`.
- Added PATCH `wishlistItems`.
- Added `editWishlistItemService()`.


### Bug Fixes

- Fixed `Wishlist` CSS file being imported to the wrong component.
- Fixed `is_purchased` not being included in the fetched wishlist items in `Wishlist`.


### Code Refactoring

- Improved clarity for label in `WishlistItemTagsFormGroup`.
- Renamed `WishlistDetails` and `WishlistItem` interfaces to `WishlistDetailsInterface` and `WishlistItemInterface` respectively to avoid name conflicts.


## [0.0.20] (2025-09-14)

### Features

- Added `WishlistContext`, `WishlistProvider` and `useWishlist` custom hook.
- Added `TextareaFormGroup` component.
- Added `WishlistsItemTagsFormGroup` component.
- Added `wishlistItemValidation` on the client side with the following functions:
  - `validateWishlistItemTitle()`.
  - `validateWishlistItemDescription()`.
  - `validateWishlistItemLink()`.
- Added `sanitizedWishlistItemTags()` under `wishlistItemTagValidation`.
- Added `wishlistItemConstants` on the client side with `WISHLIST_ITEM_TAGS_LIMIT`.
- Added `WishlistItemForm`.


### Changes

- Changed `isValidWishlistItemTagName()` to only allow ASCII letters, numbers, and underscores.
- Reworked POST `wishlistItems` to accept an array of tags.
- Reduced the strictness of validating wishlist item links.
  - Now just requires a somewhat valid TLD.


### Bug Fixes

- Fixed `EditWishlistTitleForm` not checking if the new title is identical to the existing one before making an API call.
- Removed unused props being passed to `WishlistHeaderContent`.
- Fixed the "Create a wishlist" button in `Hero` not accounting for guest users, and instead always navigating to `wishlist/new`.
- Fixed `toLocaleLowerCase()` being accidentally used instead of `toLowerCase()` in a few locations.


## [0.0.19] (2025-09-10)

### Features

- Implemented a `useEffect` in `LoadingOverlayProvider` to prevent it from persisting through navigation.
- Implemented redirect logic post sign in.
- Added `LoadingSkeleton` component.
  - Implemented this component in `Router` while `authStatus` is set to `loading`.
- Added an optional `ref` prop to `DefaultFormGroup`.
- Split `WishlistHeader` into multiple components, while also adding `WishlistHeaderContext`, `WishlistHeaderProvider`, and `useWishlistHeader` custom hook, to improve readability and scalability:
  - `WishlistHeaderContent`.
  - `WishlistHeaderEditingContainer`.
  - `EditWishlistTitleForm`.
  - `EditWishlistPrivacyLevelContainer`.
  - `DeleteWWishlistForm`.
- Implemented logic to focus the wishlist title input in `EditWishlistTitleForm` on mount.
- Implemented the use of `LoadingSkeleton` in `Wishlist` while the wishlist data is being fetched.
- Add checks to prevent duplicate wishlist titles under the same account.


### Bug Fixes

- Fixed `ContinueAccountVerificationForm` not displaying a popup message on invalid submissions.
- Fixed `webmanifest` no having the app's name.
  - A full implementation will be done down the line.
- Added missing `await` before `logUnexpectedError()` in POST ` wishlists`.


### Code Refactoring

- Extracted the routes in `Router` into an array, which is mapped out, to improve readability.
- Added explicit type definitions in a few locations.


## [0.0.18] (2025-09-08)

### Features

- Added `HistoryContext`, `HistoryProvider`, and `useHistory` custom hook.
- Added `AuthSessionContext`, `AuthSessionProvider`, and `AuthSession` custom hook.
  - This provider now supplies a try-catch-contained `signOut` function to be used wherever.
  - `Navbars` has been refactored to use this function instead for handling signing out. 
- Moved `AuthProvider` and `HistoryProvider` above the `Router`, and implemented `auth-only` and `non-auth-only` protected routes.
  - This change carried plenty of refactors and overall improvements throughout multiple components.
- Implemented the use of abort signals in `AuthProvider` and `checkForAuthSessionService()`.


### Bug Fixes

- Fixed incorrect placeholder assignment in POST `accounts/signUp` causing taken usernames to not be checked correctly.
- Fixed incorrect reference in the error message in `useAuth`.
- Fixed incorrect assignment in `errFieldRecord` in `SignIn`.


### Code Refactoring

- Added missing explicit type definitions in a few spots.
- Simplified `Navbars` and its local components.


## [0.0.17] (2025-09-05)

### Features

- Added `WishlistHeader` component under the `Wishlist` page directory.
  - Further polishing to be implemented in future patches.
- Added the following endpoints:
  - PATCH `wishlists/change/title`.
  - PATCH `wishlists/change/privacyLevel`.
  - DELETE `wishlists/:wishlistId`.
- Added the following services:
  - `changeWishlistTitleService()`.
  - `changeWishlistPrivacyLevelService()`.
  - `deleteWishlistService()`.
- Added `globalUtils` module with `copyToClipboard()` and `getFullDateString()`, alongside a few local helper functions.
- Added `wishlistUtils` module with `getWishlistPrivacyLevelName()`.
- Added `TripleDotMenuIcon` SVG.


### Bug Fixes

- Fixed padding being used instead of margin being used for the body, which is supposed to account for the bottom navbar, causing visual bugs for shorter pages.
- Fixed both navbar menus not being clickable while closed due to a flaw in how they would be closed.


### Changes

- Reduced `PopupMessage` font size on smaller devices.


### Code Refactoring

- Pulled `getAccountByAuthSessionId()` calls outside of try-catch blocks in the endpoints they're used in, to improve readability and reduce the block's size, since the function contains a try-catch block for its async call.
- Moved the account ID verification in some endpoints to the SQL query's conditional to improve readability.


## [0.0.16] (2025-09-02)

### Features

- Added `NotFound` page component and set it up as a catch-all fallback route in `Router`.
- Added `is_purchased` column to `wishlist_items` table.
- Added `UNIQUE(title, wishlist_id)` to `wishlist_items`.
- Added `wishlistValidation` module with the following functions:
  - `isValidWishlistItemTitle()`.
  - `isValidWishlistItemDescription()`.
  - `isValidWishlistItemLink()`.
- Added POST `wishlistItems`.
- Added POST `wishlistItemTags`.
- Added `WISHLIST_ITEMS_LIMIT` AND `WISHLIST_ITEM_TAGS_LIMIT`.


### Bug Fixes

- Added missing error logging in GET `wishlists/:wishlistId`.


### Code Refactoring

- Renamed validation function parameters to `value` to improve readability.
- Refactored `constants` and `clientConstants` into split, dedicated modules for better readability and modularity.


## [0.0.15] (2025-09-01)

### Features

- Added GET `wishlists:wishlistId`.


### Changes

- Changed `title` and `description` columns in `wishlist_items` table to `VARCHAR(199)` AND `VARCHAR(600)` respectively.
- Completely removed guest functionality.
  - This is a temporary measure for now, as the logic behind it had flaws. Guest functionality will be reintroduced with a different approach in future patches.


### Bug Fixes

- Fixed `InfoModal` and `ConfirmModal` not being focused after mounting. 


### Code Refactoring

- Improved usage of `useEffect` for `InfoModalProvider` and `ConfirmModalProvider`.
- Refactored wishlist-related routing structure.


## [0.0.14] (2025-08-31)

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


## [0.0.13] (2025-08-30)

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


## [0.0.12] (2025-08-28)

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


## [0.0.11] (2025-08-26)

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


## [0.0.10] (2025-08-25)

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


## [0.0.9] (2025-08-21)

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


## [0.0.8] (2025-08-19)

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


## [0.0.7] (2025-08-15)

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


## [0.0.6] (2025-08-14)

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


## [0.0.5] (2025-08-12)

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


## [0.0.4] (2025-08-09)

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


## [0.0.3] (2025-08-09)

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


## [0.0.2] (2025-08-07)

### Features

- Added `Work Sans` font.
- Implemented initial CSS structure and Tailwind configuration.
- Implemented color pallet.
- Improve spinner speed and loop background.
- Implemented initial React Router setup.
- Implemented stubs for the `Home`, `SignUp`, and `SignIn` pages.


## [0.0.1] (2025-08-06)

### Features

- Created account tables.
- Created `auth_sessions` table.
- Added `authSessions` module.
- Added `authUtils` module.
- Added account-related constants.
- Added POST `accounts/signUp`.


### Documentation Changes

- Corrected the date in the last patch.


## [0.0.0] (2025-08-06)

### Features

- Initial commit with a rough basic structure and logic.