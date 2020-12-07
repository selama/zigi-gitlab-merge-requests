import express from "express";
import { setConfig } from './config';
import { createRouter } from './express/router';
import { errorHandler } from './express/middlewares/express-error-handler';
import { RestClient } from './utils/axios-rest-client';
import { createConcurrencyLimitter } from './utils/concurrency-limitter';
import { createRequestsManager } from './utils/requests-manager';
import { createGraphqlClient } from './utils/graphql-client';
import { IGraphqlClient } from './config/config-interfaces';

const { 
  SERVICE_PORT, 
  GITLAB_API_KEY, 
  GITLAB_REST_URL, 
  GITLAB_GROUP_ID,
  GITLAB_GRAPHQL_URL 
} = process.env;

const gitlabRestClient = new RestClient(
  GITLAB_REST_URL,
  {
    "PRIVATE-TOKEN": GITLAB_API_KEY,
    'Content-Type': 'application/json'
  }
);

const gitlabGraphqlClient: IGraphqlClient = createGraphqlClient(
  GITLAB_GRAPHQL_URL, 
  {
    "PRIVATE-TOKEN": GITLAB_API_KEY,
  });

const concurrencyLimitter = createConcurrencyLimitter(15);

const requestsManager = createRequestsManager(gitlabRestClient, gitlabGraphqlClient, concurrencyLimitter);

setConfig({
  requestsManager,
  groupId: GITLAB_GROUP_ID
});

const app = express();
const port = SERVICE_PORT;

app.use(createRouter());

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server is listening...`);
});
