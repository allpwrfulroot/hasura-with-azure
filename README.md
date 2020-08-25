## Getting started with Hasura with Azure

See the presentation deck [here](https://docs.google.com/presentation/d/1qi-8ZvSA-AZZJTnnXT0CAbSJHc5QDL9vJjhctw6qlt8/edit?usp=sharing)

#### Prerequisites

- Azure account with subscription
- [Azure functions core tools](https://github.com/Azure/azure-functions-core-tools) installed (VSCode with Azure Functions extension recommended)
- Heroku account

### Set up Hasura GraphQL Engine with preview Docker image

1. Clone this repo!

2. Create your Heroku app

```
$ heroku create <my-app-name> --stack=container
$ heroku addons:create heroku-postgresql:hobby-dev -a azure-ad-demo
```

3. Add Heroku as git remote

```
$ git remote add heroku https://git.heroku.com/<my-app-name>.git
$ git push heroku master
```

4. Go to your new Heroku project and set the following environment variable:
   `HASURA_GRAPHQL_ADMIN_SECRET`

5. Add the "users" table to your new Hasura project with fields id, azure_id, and role:
   [image](placeholder)

### Set up Azure Functions

### Set up Azure AD B2C
