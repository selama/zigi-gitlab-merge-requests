# zigi-gitlab-merge-requests

## Objectives:
- Expose REST API for fetching Gitlab Merge Requests(1) for a specified Group(2).
- Providing "since" within the request, will retrieve all Merge Requests which has been updated since.
- If "since" was not provided, will retrieve all Merge Requests in "open" state.
- The returned data will be formatted acoording to given requirement.

<sup>(1) A Merge Request in Gitlab is the same as Pull Request in Github.</sup>
<br/><sup>(2) A Group in Gitlab is the same as Organization in Github.</sup>

## Usage:
- The node service is intended to be executed on a Docker.
- A Gitlab API KEY(get yours [here](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)) sould be provided to the service through `GITLAB_API_KEY` env variable.
<br/>(env variable might be easily provided to a Docker env by specifing `-e` or `--env-file` when executing `Docker run` command.
<br/> you may use the `.env` file as a template for your convinient.)
- Consuming the service:
```
    curl http://<service-host>:<service-port>/<group-id>?since=<date-string-ISO-8601-formatted>

    curl http://<service-host>:<service-port>/<group-id>
```

## Why Decisions Were Made:
### Using REST Over GraphQL
- Gitlab's GraphQL API does not support querying Group's Merge Requests which were updated after a given date.
### Using Offset-based Over Keyset-based Pagination
- The only resource currently supporting keyset-based pagination is "Projects".
### Using my own calculated pagination urls Over Header Links pagination
- In order to fetch multiple pages in parallel, I must calculate the urls myself.
<br/> the Header Links provide only the next page each time...

## Background Details:
- The project is based on this [template](https://github.com/jsynowiec/node-typescript-boilerplate).
- I've decided to use TypeScript - I like type safty as it makes the code clearer and less buggy IMO,
<br/>and enables reliable auto-complete features in my code editor.
- Searching for best practices, I've been inspired by:
    1. This [video](https://www.youtube.com/watch?v=CnailTcJV_U&ab_channel=DevMastery)
    2. This [document](https://github.com/goldbergyoni/nodebestpractices)
