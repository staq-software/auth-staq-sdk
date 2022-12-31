# Change Log

## [1.4.4] - 12/31/2022
- Update jwt package

## [1.4.3] - 12/17/2022
- Replace deprecated querystring with URLSearchParams

## [1.4.2] - 6/26/2022
- Configurable AuthStaq host

## [1.4.0] - 10/13/2021
- Expose Ci Token interface

## [1.3.3] - 8/02/2020
- Fix missing return for create account 

## [1.3.2] - 8/02/2020
- Bump dependencies

## [1.3.1] - 8/02/2020
- Fix password auth & register - pass creds to request

## [1.3.0] - 8/02/2020
- Configurable auth host

## [1.2.0] - 7/25/2020
- Add credential factory that can determine jwt type

## [1.1.1] - 7/25/2020
- Bugfix: call correct property to check expiration in maybeRefresh
- Bugfix: check if token is string correctly
- Bump base http client for better http error stack traces

## [1.1.0] - 7/3/2020
- Fix Token isValid to return bool 
- Add Token verify that throws
- Make refresh token optional in UserCredentials 

## [1.0.0] - 7/3/2020
- Skd 1.0!
