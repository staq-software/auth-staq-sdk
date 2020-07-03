[![npm](https://img.shields.io/npm/v/auth-staq-sdk.svg)](https://www.npmjs.com/package/auth-staq-sdk)

# AuthStaq SDK
Simple js library for integrating with [AuthStaq](https://auth.staqsoftware.com).

## Contents
* [Quick start](#quick-start)
* [Simple authentication](#simple-authentication)
  * [Authorization code grant](#authorization-code-grant)
  * [Password grant](#password-grant)
  * [Register user](#registration)
  * [Client credentials grant](#client-credentials-grant)
  * [Refresh token grant](#refresh-token-grant)
* [Sdk api and objects](#sdk-api-and-objects)
  * [The sdk](#authstaq-sdk)
  * [Oauth api client](#oauthclient)
  * [Oauth machine client](#oauthmachineclient)
  * [Token](#token)
  * [ClientCredentials](#clientcredentials)
  * [UserCredentials](#usercredentials)
  * [StaqAccount](#staqaccount)
  
## Quick start
```
const sdk = new AuthStaqSdk({
  clientId: 'abc-123',
  clientSecret: '123-abc',
  redirectUri: 'https://mysite.com/auth/exchange'
})

const credentials = sdk.passwordAuth(email, password)
const refreshedCreds = sdk.refreshAccessToken(credentials.refreshToken)
```

## Simple authentication
Easily authenticate users for your application using AuthStaq's Oauth 2 api.  Example using express type framework, but concepts apply to any node.js application.

### Authorization Code Grant
```
const sdk = new AuthStaqSdk({ ... })

// Send user off to be authenticated
app.get('/sign-in', (req, res, next) => {
  if (!req.session.currentUser)
    return res.redirect(sdk.authenticateUrl())
  }
  return res.redirect('/home')
}

// Auth code exchange.  Registered AuthStaq redirect url.
app.get('/auth/exchange', async (req, res) => {
  const userCredentials = await sdk.authCodeExchange(req.query.code)
  req.session.currentUser = await sdk.getUserInfo(userCredentials.accessToken)
  return res.redirect('/home')
}
```

### Password Grant
#### Authentication
```
const sdk = new AuthStaqSdk({ ... })

// Render some sign in page
app.get('/sign-in', (req, res) => {
  return res.render('sign-in')
}

// Sign in page form submission
app.post('/sign-in', async (req, res) => {
  const { email, password } = req.body
  try {
    const credentials = await sdk.passwordAuth(email, password)
    req.session.currentUser = await sdk.getUserInfo(credentials.accessToken)
    return res.redirect('/home)
  } catch (e) {
    if (e.status && e.status === 400)
      // Handle invalid credentials
      ...
    }
  }
}
```

#### Registration
```
const sdk = new AuthStaqSdk({ ... })

// Render some account creation page
app.get('/register', (req, res) => {
  return res.render('register')
}

// Registration page form submission
app.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, confirmation } = req.body
  try {
    const credentials = await sdk.createAccount({ email, password, firstName, lastName, confirmation })
    req.session.currentUser = await sdk.getUserInfo(credentials.accessToken)
    return res.redirect('/home)
  } catch (e) {
    if (e.status && e.status === 422)
      // Handle invalid credentials
      ...
    }
  }
}
```

### Client Credentials Grant
```
const clientCredentials = sdk.getClientCredentials()
const myAppsUsers = await sdk.getOAuthApiMachineClient(clientCredentials.accessToken).getAccounts
```

### Refresh Token Grant
```
const refreshedCreds = sdk.refreshAccessToken(credentials.refreshToken)
await sdk.getUserInfo(refreshedCreds.accessToken)
```

## Sdk api and objects

#### AuthStaqSdk  
**the** AuthStaq sdk used for easy integration with AuthStaq

* Methods
  * constructor | `new AuthStaqSdk(options: Object): OauthClient`
    * options:
      * clientId `[String]` - your AuthStaq application's id
      * clientSecret `[String]` - your AuthStaq application's secret
      * clientSignature `[String]` - _(Optional)_ your AuthStaq application's signature, used to verify the contents of a signed jwt.  Required for `verifyToken`
      * redirectUri `[String]` - _(Optional)_ a valid, registered redirect uri for your application.  Required for `authenticateUrl`, the AuthStaq oauth api redirects to this location with the authorization code during Auth Code Grant flow, where your application will exchange the auth code for an access token using `authCodeExchange`.
  * `authenticateUrl(): String`- returns the url to redirect the user to sign in via auth stack. This starts the Authorization Code Grant auth flow.  On successful login the request will be redirected bac to the redirectUri location to exchange the code for an access token.
  * `authCodeExchange(code: String): Promise<UserCredentials>` - exchange the auth code from AuthStaq for the user's access token
    * code: `[String]` - authorization code obtained from AuthStaq.  This code can be parsed from the requests query string param named "code", example: `my-site/auth/callback?code=abc-123`
    * **returns** UserCredentials
  * `passwordAuth(email: String, password: String): Promise<UserCredentials>` - use the Password Grant Type to exchange the user's credentials for an access token
    * email `[String]`
    * password `[String]`
    * **returns** UserCredentials
  * `getClientCredentials(): Promise<ClientCredentials>` - use the Client Credentials Grant type to exchange your application's client id & secret for client credentials (an access token for your application)
    * **returns** ClientCredentials
  * `maybeRefresh(credentials: UserCredentials): Promise<UserCredentials>` - use the Refresh Token Grant to get a new access token for a user if the current access token is expired, otherwise return current credentials
    * credentials `[UserCredentials]` - user's credentials to refresh
    * **returns** UserCredentials
  * `refreshAccessToken(refreshToken: Token): Promise<UserCredentials>` - use the Refresh Token Grant to obtain a new access token for a user
    * refreshToken `[Token]` - user's refresh token, used to obtain new access token
    * **returns** UserCredentials
  * `getUserInfo(accessToken: Token): Promise<StaqAccount>` - use the OpenID Connect flow to obtain a user's profile using their access token
    * accessToken `[Token]` - user's access token
  * `getAccount(accountId: String): Promise<StaqAccount>` - fetch an account registered to your application by id using your application's client credentials.  Will fetch client credentials if you have not explicitly called `getClientCredentials`.
    * accountId `[String]` - the user's AuthStaq account id.  Account id can be found in the access token - `token.decoded.sub`
    * **returns** AuthStaqUser
  * `createAccount(body: Object): Promise<UserCredentials>` - register a new user to your application
      * body `[Object]`: All fields are required
        * firstName
        * lastName
        * email - user email address, must be unique within your application
        * password - user password, strongly encrypted before storage
        * confirmation - password confirmation, must match password
      * **returns** UserCredentials
  * `verifyToken(token: Token): Boolean` - verify a token was issued by a trusted service using your client signature.
    * token `[Token]` - token to verify
  * `getOauthApiClient(accessToken: Token): OauthClient` - get instance of the AuthStaq Oauth api client
    * accessToken `[Token]` - _(Optional)_ if passed the oauth client will automatically add the proper `Authorication` http header to outbound requests
  * `getOauthApiMachineClient(accessToken: Token): OauthMachineClient` - get instance of AuthStaq Oauth api client that exposes privileged endpoints that require client credentials.
    * accessToken `[Token]` - _(Required)_ your application's client credentials, you can get client credentials with `getClientCredentails` 
  
#### OauthClient 
A [http client](https://www.npmjs.com/package/base-http-client) used by the sdk to interact with the AuthStaq Oauth 2 api

* Methods
  * constructor | `new OauthClient(options: Object): OauthClient` - Example: `new OauthClient({ headerOptions: { Authorization: 'Bearer abc-123' } })` 
    * options `[Object]` - see [base-http-client](https://www.npmjs.com/package/base-http-client#httpclient) for valid options.
  * `register(body: Object, clientId: String, clientSecret: String): Promise<UserCredentials>` - create an AuthStaq account for your application
    * body `[Object]`: All fields are required
      * firstName
      * lastName
      * email - user email address, must be unique within your application
      * password - user password, strongly encrypted before storage
      * confirmation - password confirmation, must match password
    * clientId `[String]` - your AuthStaq application's client id    
    * clientSecret `[String]` - your AuthStaq application's corresponding client secret
    * **returns** UserCredentials
  * `passwordAuth(body: Object, clientId: String, clientSecret: String): Promise<UserCredentials>` - authenticate a user with the Password Grant type    
    * body `[Object]`
      * username - the user's registered email address
      * password
    * clientId `[String]` - your AuthStaq application's client id    
    * clientSecret `[String]` - your AuthStaq application's corresponding client secret
    * **returns** UserCredentials
  * `refreshToken(refreshToken: String, clientId: String, clientSecret: String): Promise<UserCredentials>` - refresh a user's access and refresh token   
    * refreshToken `[String]` - the user's refresh token jwt string    
    * clientId `[String]` - your AuthStaq application's client id    
    * clientSecret `[String]` - your AuthStaq application's corresponding client secret
    * **returns** UserCredentials
  * `getUserInfo(): Promise<StaqAccount>` - fetches the profile information for a user using their access token.  The user's access token must be sent a http header parameter - `Authorization`: `Bearer {userAccessToken}`
    * **returns** StaqUser
  * `clientAuth(clientId: String, clientSecret: String): ClientCredentials` - authenticate a client using the Client Credentials Grant type and retrieve client credentials
    * clientId `[String]` - your AuthStaq application's client id    
    * clientSecret `[String]` - your AuthStaq application's corresponding client secret
    * **returns** ClientCredentials
  * `authCodeExchange(code: String, clientId: String, clientSecret: String): Promise<UserCredentials>` - exchange an authorization code returned during the Authorization Code Grant type for the user's access and refresh token
    * code `[String]` - authorization code returned from the auth server after successful user authentication
    * clientId `[String]` - your AuthStaq application's client id    
    * clientSecret `[String]` - your AuthStaq application's corresponding client secret

#### OauthMachineClient 
A [http client](https://www.npmjs.com/package/base-http-client) AuthStaq Oauth api client that exposes privileged endpoints that require client credentials.

* Methods
  * constructor | `new OauthClient(options: Object): OauthClient` - Example: `new OauthMachineClient({ headerOptions: { Authorization: 'Bearer client-creds' } })` 
    * options `[Object]` - see [base-http-client](https://www.npmjs.com/package/base-http-client#httpclient) for valid options.
  * `getAccount(accountId: String): Promise<StaqAccount>` - fetch an account registered to your application by id using your application's client credentials.  Requires client credentials.
    * accountId `[String]` - the user's AuthStaq account id.  Account id can be found in the access token - `token.decoded.sub`
    * **returns** AuthStaqUser
  * `getAccounts(query: Object): Promise<Array<StaqAccount>>` - fetch accounts registered to your application
    * query `[Object]` - query object optionally containing `page` (page offset) and `perPage` (number of results returned)
    * **returns** array of AuthStaqUser
    
#### Token
Class representing a json web token

* Properties
  * value `[String]` - the jwt string
  * isExpired `[Boolean]` - boolean indicating if the token is expired
  * expiresAt `[Date]` - token expiration
  * clientId `[String]` - id of the token issuer extracted from the decoded jwt
  * decoded `[Object]` - object representation of the jwt, decoded with [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
* Methods 
  * constructor | `new Token(value: String): Token`
    * value `[String]` - the json web token string, can include "Bearer " prefix
    * **returns** Token instance
  * `isValid(signature: String): Boolean` - will verify the json web token using the client signature
    * signature `[String]` - your AuthStaq client signature, used to verify the contents of a signed jwt
    * **returns** boolean, specifying if token is valid
  
#### ClientCredentials
Class representing credentials returned by "Client Credentials Grant" type

* Properties
  * accessToken `[Token]` - the client credentials token used to identify, authenticate, and authorize the client in outbound requests
  * isValid `[Boolean]` - boolean indicating whether or not the credentials are expired, does *not* verify the contents of the token
  * isExpired `[Boolean]` - boolean indicating if the credentials are expired
  
#### UserCredentials
Class representing user credentials, returned by "Authorization Code Grant", "Password Grant", and "Refresh Token Grant"

* Properties
  * accessToken `[Token]` - the user credentials access token used to identify, authenticate, and authorize requests on behalf of the user
  * valid `[Boolean]` - boolean indicating whether or not the credentials are expired, does *not* verify the contents of the token

#### StaqAccount
An AuthStaq user

* Properties
  * id `[String]` - the AuthStaq account id
  * email
  * firstName
  * lastName
  * lastLogin
  * createdAt
  * updatedAt

## Contributing
Feel free to open issues or pull requests!
