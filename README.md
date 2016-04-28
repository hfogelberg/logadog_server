#Log A Dog
Server backend for the Logadog iOS app written in Node JS.

## Publicly available API
###Check that the API is alive
/api

###Sign up and create user
POST /api/users/:name/:email/:username/:password

###Log in and create token
POST /api/authenticate/:username/:password

##API routes that require a token

###Show user

###Change user

###
