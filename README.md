## Getting started with Hasura and Azure

See the presentation deck [here](https://docs.google.com/presentation/d/1qi-8ZvSA-AZZJTnnXT0CAbSJHc5QDL9vJjhctw6qlt8/edit?usp=sharing)

[See the PR](https://github.com/hasura/graphql-engine/pull/3575) for additional info + preview updated docs

#### Prerequisites

- Azure account with subscription
- [Azure functions core tools](https://github.com/Azure/azure-functions-core-tools) installed (VSCode with Azure Functions extension recommended)
- Heroku account

### Set up Hasura GraphQL Engine with preview Docker image

1. Clone this repo!

```
$ git clone https://github.com/allpwrfulroot/hasura-with-azure.git
```

1. Create your Heroku app

```
$ heroku create <my-app-name> --stack=container
$ heroku addons:create heroku-postgresql:hobby-dev -a <my-app-name>
```

1. Add Heroku as git remote

```
$ git remote add heroku https://git.heroku.com/<my-app-name>.git
$ git push heroku master
```

1. Add the "users" table to your new Hasura project with fields id, azure_id, and role.

![screenshot of users table](/screenshots/create-users-table.png)

2. Make a few fake users and check that your users query works as expected

3. Go to your new Heroku project and set the environment variable `HASURA_GRAPHQL_ADMIN_SECRET` (under Settings -> Config Vars). You'll have to use this admin secret to regain access to the Console

### Set up Azure Functions

1. Create a directory for your new Azure functions project and initialize it. You'll be taken through a couple of setup questions: in this demo, we've selected "node" and "JavaScript"

```
$ mkdir <functions-directory-name>
$ cd <functions-directory-name>
$ func init .
```

2. Create your first function! Again, you'll be asked a couple of questions: here we selected "HTTP trigger" and named our function "getHasuraInfo". Check to see that it all works locally, but then you can stop the server.

```
$ func new
$ npm install
$ func start
```

3. For the moment, we'll keep things very simple. Just hard-code your custom claims into the response body; we'll add the business logic later. Check again that it still works locally.

4. Deploy! ([This article](https://cloudskills.io/blog/azure-functions-deploy) is helpful for setting up VSCode and deploying via the VSCode Azure Functions extension.) Get the function endpoint with code included

### Set up Azure AD B2C

1. Set up an Azure AD B2C tenant [according to the docs](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-tenant)

- At the 'Grant admin consent for (your tenant name)' step, you can grant by clicking the ". . ." button next to "Add a permission"

- When setting up your app, add `https://jwt.ms` as a Web Redirect URI. This is a useful tool for checking Azure JWT's

2. Set up the B2C tenant for custom claims [according to the docs](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-get-started)

- This demo skips the Facebook social login
- This step is just setup of the custom claims flow; we will add the actual custom fields in the next step

#### Test that you can generate a valid JWT with this new flow

- Navigate back to Identity Experience Framework dashboard
- Scroll down to see the list of custom policies, select "B2C_1A_signup_signin"
- Select `https://jwt.ms` as the reply url
- Run! Sign up and see that a new user is created and a valid JWT provided

### Modify your Azure AD B2C setup to include your custom claims

1. Follow the instructions [from this tutorial](https://daniel-krzyczkowski.github.io/Azure-AD-B2C-With-External-Authorization-Store/) to modify your custom policies with custom claims

- See the demo custom policy files in this repo
- Use the static-response version of your Azure function for now

2. Test with "B2C_1A_signup_signin" again to verify that you're getting a valid JWT with the expected claims

3. Update and re-deploy your Azure function with the actual business logic to provide the desired claims response. See 'getHasuraInfo.js' for an example that checks for an existing Hasura user with that Azure ID, creates a new one if Azure ID not found, and returns the role + user ID to be provided in the final claim.

- Set up environment variables locally in `local.settings.json` under "values". Add the environment variables for prod via the Azure Portal: go to your Functions App, navigate to 'Configuration' (under 'Settings'), and add your environment variables as new application settings. Don't forget to save!
- Check again that everything still starts locally as a sanity check before re-deploying the function

4. Test again with "B2C_1A_signup_signin" again to verify that you're getting a valid JWT with the expected claims

![screenshot of valid token](/screenshots/final-custom-jwt.png)

### Update your Hasura instance to use Azure tokens

1. Add the HASURA_GRAPHQL_JWT_SECRET environment variable to your Heroku app (under Settings -> Config Vars). The example from this repo:

```

{"jwk_url":"https://<mytenant>.b2clogin.com/<mytenant>.onmicrosoft.com/discovery/v2.0/keys?p=b2c_1a_signup_signin","claims_map":{"x-hasura-allowed-roles":["user","admin"],"x-hasura-default-role":{"path":"$.extension_hasura_role"},"x-hasura-user-id":{"path":"$.extension_hasura_id"}}}

```

2. Log in with "B2C_1A_signup_signin" again and check that the JWT now includes your custom claims. Copy the token

3. Use the token via an Authorization header in the graphiql playground in the Hasura console. Check that you can query for users and get back only the one whose user ID matches the one in the token!

![screenshot of users query](/screenshots/final-authorized-query.png)
