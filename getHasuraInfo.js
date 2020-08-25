const fetch = require("node-fetch");

const upsertUserQuery = `
      mutation($azure_id: String!){
        insert_users_one(
                  object: { azure_id: $azure_id }, 
                  on_conflict: { constraint: users_azure_id_key, update_columns: azure_id }
              ) {
          id
          role
        }
      }
    `;

module.exports = async function (context, req) {
  context.log("HTTP trigger function processed a request.");
  const azure_id = req.body && req.body.userId;
  try {
    if (!azure_id) {
      throw new Error("Something went wrong");
    }
    const execute = await fetch(process.env.HASURA_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        query: upsertUserQuery,
        variables: { azure_id },
      }),
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_ADMINSECRET,
      },
    });
    const { data, errors } = await execute.json();
    if (errors) {
      throw new Error("Something went wrong");
    }
    context.res = {
      headers: { "Content-Type": "application/json" },
      body: {
        hasuraRole: data.insert_users_one.role,
        hasuraId: data.insert_users_one.id,
      },
    };
  } catch (err) {
    context.res = {
      headers: { "Content-Type": "application/json" },
      status: 400,
      body: {
        message: "Something went wrong",
      },
    };
  }
};
