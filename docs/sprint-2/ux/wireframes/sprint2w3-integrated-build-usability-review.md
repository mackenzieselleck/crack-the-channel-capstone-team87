# Sprint 2 Integrated Build Usability Review

**Project:** Crack the Channel  
**Sprint:** Sprint 2  
**Reviewer:** Jerome  
**Date:** 04/10/2026  
**Build reviewed:** Current integrated `main` branch running locally  
**Status:** Completed usability pass  

## Purpose

This usability pass reviews the integrated Sprint 2 build from the perspective of a beginner learner. The focus was on the landing page, authentication flow, routing, protected pages, consistency, error feedback and general beginner usability.

The onboarding page has now been implemented and functionally retested on the feature branch. The main navbar and mobile behaviour remain deferred because those areas are still incomplete or do not yet have an agreed testing approach.

## Routes Tested

- `/`
- `/signup`
- `/email-confirmation`
- `/login`
- `/onboarding`
- `/learn`
- `/learn/test-module`
- `/simulator`

## Usability Checklist

| Area | Check | Result | Notes |
|---|---|---|---|
| Landing | Platform identity and purpose are clear | Pass | Crack the Channel and its learning purpose are immediately understandable. |
| Landing | Primary CTA is clear | Pass | Main learning action is obvious. |
| Landing | Start Learning, Sign up and Log in navigation | Pass | Links route to the expected pages. |
| Sign-up | Form labels and primary action are clear | Pass | Form is straightforward for a first-time user. |
| Sign-up | Existing-email behaviour | Minor issue | Signing up with an already-used email still sends the user to the confirmation page. |
| Sign-up | Password complexity validation | Major issue | A password without a special character was accepted during testing. |
| Sign-up | Confirm-password validation | Major issue | A different confirmation password, including case differences, was still accepted. |
| Sign-up | Successful new account creation | Pass | Fresh account creation proceeds to the email-confirmation page. |
| Email confirmation | Page clearly explains the next step | Pass | Verification instructions are clear. |
| Email confirmation | Verification link destination | Major issue | Verification succeeds, but the user is redirected to `/` instead of onboarding or login. |
| Email confirmation | Resend email control | Minor issue | Resend email is still a visual placeholder and does not perform an action. |
| Login | Form clarity | Pass | Email/password fields and primary action are clear. |
| Login | Invalid credential feedback | Pass | Error feedback is understandable. |
| Login / Onboarding | New-user post-login routing | Major issue | Newly verified users are sent directly to `/learn/test-module`, bypassing onboarding. |
| Login | Existing-user destination | Pass with note | All successful logins currently go to `/learn/test-module`; this appears to be a temporary development destination. |
| Onboarding | Page clarity and profile form | Pass | The implemented onboarding page clearly asks for first and last name and matches the existing site theme. |
| Onboarding | Profile save | Pass | First and last name save successfully to the user profile. |
| Onboarding | Continue / completion routing | Pass | After completing onboarding, Continue now redirects successfully to `/dashboard`. |
| Protected routes | `/simulator` while logged out | Pass | Redirects to `/login`. |
| Protected routes | `/learn` while logged out | Pass | Redirects to `/login`. |
| Protected routes | `/learn/test-module` while logged out | Major issue | Does not redirect to login; instead shows “Could not load this module.” |
| Navigation | Main navbar | Deferred | Navbar is still a work in progress. |
| Navigation | Browser Back / Forward | Pass | Navigation behaves normally with no loops or broken pages observed. |
| Consistency | Visual design consistency | Pass | Colours, typography, buttons, spacing and general hierarchy feel coherent. |
| Consistency | Terminology consistency | Pass | Labels and wording are consistent across tested pages. |
| Responsive | Desktop layout | Pass | No major overlap, clipping or layout problems observed. |
| Responsive | Mobile layout | Deferred | Mobile compatibility/testing approach has not yet been established. |
| Error states | General error-state clarity | Pass | Tested error messages generally explain what went wrong clearly. |
| Beginner UX | Next-step clarity | Pass | Tested pages generally make the next action obvious. |
| Beginner UX | Beginner-friendly wording | Pass | Language is understandable and avoids unnecessary technical complexity. |

## Findings Requiring Follow-up

| # | Area | Finding | Severity | Recommended Action | Status |
|---|---|---|---|---|---|
| 1 | Sign-up | Existing email proceeds to the confirmation page without clarifying the account state. | Minor | Review whether the current behaviour is intentional; ensure the user receives an appropriate next step without exposing unnecessary account information. | Open |
| 2 | Sign-up | Password without a special character was accepted. | Major | Check that the intended password validation is being enforced in the integrated sign-up flow. | Open |
| 3 | Sign-up | Confirm-password field does not prevent submission when it differs from the original password. | Major | Validate the confirmation value before account creation, or remove/disable the field until it is functional. | Open |
| 4 | Email verification | Verification link redirects the new user to `/` instead of onboarding or login. | Major | Route newly verified users into the intended first-time-user flow. | Open |
| 5 | Email confirmation | `Resend email` is visible but nonfunctional. | Minor | Implement the action, or disable/hide the control until it is available. | Open |
| 6 | Authentication / onboarding | Newly verified users can log in and go directly to `/learn/test-module`, bypassing onboarding. | Major | Ensure first-time users must complete onboarding before entering protected learning content. | Open |
| 7 | Route protection | `/learn/test-module` is reachable while logged out and displays “Could not load this module” instead of redirecting to `/login`. | Major | Apply the same authentication/onboarding protection used by `/learn` and `/simulator` to dynamic learning-module routes. | Open |

## Onboarding Retest

The onboarding page has now been implemented on the feature branch and retested.

- The page is visually consistent with the existing Crack the Channel landing and authentication theme.
- First name and last name are saved successfully to the user profile.
- Clicking **Continue** now leaves `/onboarding` and redirects to `/dashboard` as intended.
- The dashboard itself is still a simple work-in-progress page, but the onboarding completion flow is no longer stuck.

This confirms that the onboarding page itself is functioning correctly when accessed directly.

The separate integration finding that newly verified users can bypass onboarding through the current login flow remains open until the authentication routing is updated.

## Deferred Areas

### Main Navbar
The main navbar is still under development and was excluded from the usability result.

### Mobile Compatibility
Desktop behaviour was tested successfully. Mobile usability was not assessed because the team has not yet established the mobile compatibility/testing approach.

## Overall Outcome

The integrated Sprint 2 build is generally clear, visually consistent and beginner-friendly across the landing, sign-up, email-confirmation, login and onboarding pages. Core desktop navigation and the main protected `/learn` and `/simulator` routes behaved as expected.

The onboarding page itself now works correctly when accessed directly: profile details save successfully and completion redirects to `/dashboard`. The remaining usability risks are concentrated in the wider authentication routing and route protection. In particular, newly verified users can still bypass onboarding through the current login flow, the email verification redirect does not continue the intended journey, and `/learn/test-module` is not protected consistently. Sign-up validation also needs attention for password complexity and confirm-password behaviour.

These remaining issues should be addressed or explicitly accepted before the full authentication/onboarding journey is considered complete for Sprint 2 UX sign-off.
