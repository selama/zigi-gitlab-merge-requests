import express from "express";
import { setConfig } from './config';
import { createRouter } from './router';
import { errorHandler } from './middlewares/express-error-handler';
import { RestClient } from './middlewares/axios-rest-client';

const gitlabRestClient = new RestClient(
  process.env.GITLAB_BASE_URL,
  {
    "PRIVATE-TOKEN": process.env.GITLAB_API_KEY,
    'Content-Type': 'application/json'
  }
);

setConfig({ 
  gitlabRestClient,
  groupId: process.env.GITLAB_GROUP_ID
});

const app = express();
const port = process.env.SERVICE_PORT || 5000;

app.use(createRouter());

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server is listening...`);
});
