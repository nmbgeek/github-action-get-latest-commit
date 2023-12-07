# Get Latest Commit

A simple Github action to get the latest commit hash and description from another repository. No authentication required. This is adapted from pozetroninc/github-action-get-latest-release because the repo I was automating builds for do not create releases and I need to tag my docker builds.

# Configuration

Example Repository - https://github.com/nmbgeek/github-action-get-latest-commit

**Inputs**

| Name  | Description                                              | Example                         |
| ----- | -------------------------------------------------------- | ------------------------------- |
| owner | The Github user or organization that owns the repository | nmbgeek                         |
| repo  | The repository name                                      | github-action-get-latest-commit |

**or**
Name | Description | Example
--- | --- | ---
repository | The repository name in full | nmbgeek/github-action-get-latest-commit

**Additional Inputs (Optional)**
Name | Description | Example
--- | --- | ---
branch | Specify branch. If blank the default branch, usually main, will be used.
token | GitHub token or personal access token | `${{ secrets.GITHUB_TOKEN }}` or `${{ secrets.PERSONAL_ACCESS_TOKEN }}`

Using the `GITHUB_TOKEN` will avoid the action [failing due to hitting API rate limits](https://github.com/pozetroninc/github-action-get-latest-release/issues/24) from the IP address of the GitHub runner your action is running on. Using a `PERSONAL_ACCESS_TOKEN` is required to get the release information from a private repo. You can read about [how to create a personal access token here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) and how to [add this as a repository secret here](https://docs.github.com/en/github/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets).

**Outputs**

| Name        | Description                  | Example                    |
| ----------- | ---------------------------- | -------------------------- |
| shorthash   | First 7 of the commit's hash | 0bd441a                    |
| hash        | Full sha hash for commit     | 0bd441a8a1d62dc22fb3704... |
| description | Commit message               | This is an example commit  |

# Usage Example

```yaml
name: Docker Build and Push

on:
  repository_dispatch:
    types: [build-docker-image]
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - id: lastcommit
        uses: nmbgeek/github-action-get-latest-commit@main
        with:
          owner: abtassociates
          repo: eva
          branch: main

      - name: set release date
        run: |
          echo "RELEASE_DATE=$(date --rfc-3339=date)" >> ${GITHUB_ENV}

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: nmbgeek/eva-hud-hmis:latest, nmbgeek/eva-hud-hmis:${{ env.RELEASE_DATE }}, nmbgeek/eva-hud-hmis:${{ steps.lastcommit.outputs.shorthash }}
```

To use the current repo:

```yaml
with:
  repository: ${{ github.repository }}
```

To use authentication token:

```yaml
with:
  token: ${{ secrets.GITHUB_TOKEN }}
```
