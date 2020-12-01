import express from "express";
import { setConfig } from './config';
import { createRouter } from './express/router';
import { errorHandler } from './express/middlewares/express-error-handler';
import { RestClient } from './utils/axios-rest-client';
import { GitlabGraphqlClient } from './utils/graphql-client/graphql-sdk-client';
import { createConcurrencyLimitter } from './utils/concurrencyLimitter';

const { 
  SERVICE_PORT, 
  GITLAB_API_KEY, 
  GITLAB_REST_URL, 
  GITLAB_GRAPHQL_URL, 
  GITLAB_GROUP_ID 
} = process.env;

const gitlabRestClient = new RestClient(
  GITLAB_REST_URL,
  {
    "PRIVATE-TOKEN": GITLAB_API_KEY,
    'Content-Type': 'application/json'
  }
);

const gitlabGraphqlClient = new GitlabGraphqlClient(
  GITLAB_GRAPHQL_URL,
  {
    "PRIVATE-TOKEN": GITLAB_API_KEY,
  }
)

const concurrencyLimitter = createConcurrencyLimitter(5);

setConfig({
  concurrencyLimitter, 
  gitlabRestClient,
  gitlabGraphqlClient,
  groupId: GITLAB_GROUP_ID
});

const app = express();
const port = SERVICE_PORT;

app.use(createRouter());

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server is listening...`);
});
