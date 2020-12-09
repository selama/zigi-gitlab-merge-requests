# zigi-gitlab-merge-requests

## Objectives:
- Expose REST API for fetching Gitlab Merge Requests(1) for a specified Group(2).
- Providing "since" within the request, will retrieve all Merge Requests which has been updated since.
- If "since" was not provided, will retrieve all Merge Requests in "opened" state.
- Pagination on Gitlab's API is done automatically.
- The returned data will be formatted acoording to given requirement.
- Theres no "Review" that match the Github Review. instead, an approver might add discussionNotes for a Merge Requets.
- Also, review_requests: not available through API yet - comming soon: (https://gitlab.com/gitlab-org/gitlab/-/issues/290998)

<sup>(1) A Merge Request in Gitlab is the same as Pull Request in Github.</sup>
<br/><sup>(2) A Group in Gitlab is the same as Organization in Github.</sup>

## Usage:
- The node service is intended to be executed on a Docker.
- A Gitlab API KEY(get yours [here](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)) sould be provided to the service through `GITLAB_API_KEY` env variable.
<br/>(env variable might be easily provided to a Docker env by specifing `-e` or `--env-file` when executing `Docker run` command.
<br/> you may use the `.env` file as a template for your convinient.)
- Service environment should have the following vars configured:
```
GITLAB_API_KEY - the API key.
GITLAB_GROUP_ID - groupId for which the merge requests are queried.
GITLAB_REST_URL=https://gitlab.com/api/v4/ - gitlab's rest api url.
GITLAB_GRAPHQL_URL=https://gitlab.com/api/graphql/ - gitlab's graphql api url.
SERVICE_PORT - internal service port - used by express server.
```
- Consuming the service:
```
    curl http://<service-host>:<service-port>/refresh?since=<date-string-ISO-8601-formatted>

    curl http://<service-host>:<service-port>/refresh
```

## Why Decisions Were Made:
### Using REST and GraphQL
- Gitlab's GraphQL API does not support querying Group's Merge Requests which were updated after a given date.
- Gitlab's GraphQL API throws a lot of timeouts for random requests - therefore I decided to use the REST API when possible.
- I retrieve everything in REST, beside the code 'addition' and 'deletion' Stats, which only available for GraphQL.
- In 2 points in the code, I've decided on purpouse to prefer cleaner code over optimal concurrency and performance:
1. first I wait for *all* initial pages with basic Merge Requests data to be resolved, and only then I fetch extended data.
2. I format the data only after all data retrieved.
### Using Offset-based Over Keyset-based Pagination
- The only resource currently supporting keyset-based pagination is "Projects".
### Using my own calculated pagination urls Over Header Links pagination
- In order to fetch multiple pages in parallel, I must calculate the urls myself.
<br/> the Header Links provide only the next page each time...

### Resiliancy
- I've used the biggest group I found (in terms of number of opened Merge Requests and activity), when I've developed and tried my service.
<br/>It is the gitlab.org group - which has ~2500 opened Merge Requests
- For such a large group, a lot of requests are required, and their API sometimes can't handle this numbers.
- therefore I've created a a mechnism to limit my concurrent requests, and in order to be able to recover from "Too Many Requests" error, while pausing requests, and then retry.

## Background Details:
- The project is based on this [template](https://github.com/jsynowiec/node-typescript-boilerplate).
- I've decided to use TypeScript - I like type safty as it makes the code clearer and less buggy IMO,
<br/>and enables reliable auto-complete features in my code editor.
<br/>and it also has very nice codegen to be used for graphql.
- Used Pino as logger.
- Searching for best practices, I've been inspired by:
    1. This [video](https://www.youtube.com/watch?v=CnailTcJV_U&ab_channel=DevMastery)
    2. This [document](https://github.com/goldbergyoni/nodebestpractices)
    3. And many Uncle Bob's talks I've watched. (love his attitude)
