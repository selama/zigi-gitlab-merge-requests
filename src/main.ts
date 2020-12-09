import express from "express";
import { Config, setConfig } from './config';
import { createRouter } from './express/router';
import { errorHandler } from './express/middlewares/express-error-handler';
import { RestClient } from './utils/axios-rest-client';
import { createConcurrencyLimitter } from './utils/concurrency-limitter';
import { createRequestsManager } from './utils/requests-manager';
import { createGraphqlClient } from './utils/graphql-client';
import { IGraphqlClient } from './config/config-interfaces';
import pino from 'pino';
import httpPino from 'pino-http';
import createRequestIdEnricher from 'express-request-id';
import { requestStartedLogger } from './express/middlewares/express-request-start-logger';


const { 
  SERVICE_PORT, 
  GITLAB_API_KEY, 
  GITLAB_REST_URL, 
  GITLAB_GROUP_ID,
  GITLAB_GRAPHQL_URL 
} = process.env;

const logger = pino();
const httpLogger = httpPino({
  genReqId: (req) => req.id,
  logger
});

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

const concurrencyLimitter = createConcurrencyLimitter(15, logger);

const requestsManager = createRequestsManager(gitlabRestClient, gitlabGraphqlClient, concurrencyLimitter);

const config: Config = {
  requestsManager,
  groupId: GITLAB_GROUP_ID,
  logger
};

setConfig(config);

const app = express();
const port = SERVICE_PORT;

app.use(createRequestIdEnricher());

app.use(httpLogger);

app.use(requestStartedLogger);

app.use(createRouter());

app.use(errorHandler);

app.listen(port, () => {
  config.logger.info(`server is listening...`);
});
