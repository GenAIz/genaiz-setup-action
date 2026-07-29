# Genaiz Setup Action

This Action installs the [genaiz-cli](https://github.com/GenAIz/genaiz-cli) for your GitHub Action Workflows. The action
provides the following functionality:

* Install any tagged version of the genaiz-cli by version or by specifying `latest`
* Initiate a session with any _genaiz orchestrator url_ using a session token kept in secrets
* Validate a pre-established session on self-hosted runners for specified _genaiz orchestrator url_

## Usage

This Action installs the specified client and overrides the **$PATH** of any Workflow to use the specified version. If a
`genaiz` command was available before, it is overridden.

> [!IMPORTANT]
> Although this action will guard against leaking credentials in the Runner environment, it is recommended to use it
> only on self-hosted secured GitHub Runner instances.

Simple `workflow_dispatch` Example:

```yaml
name: publish-action.yml

on:
  workflow_dispatch:
    inputs:
      genaiz-url:
        description: url of the publishing orchestrator
        required: true

jobs:
  test-publish-job:
    name: Publish my GenAIz solution
    runs-on: my-private-runner
    steps:
      - uses: genaiz/genaiz-setup-action@latest
        with:
          - genaiz-cli-version: ${{inputs.genaiz-cli-version}}
          - genaiz-url: ${{inputs.genaiz-url}}
          - genaiz-session: ${{secrets.MY_GENAIZ_TOKEN}}
      - uses: actions/checkout@v7.0.1
      - name: Build 
        run: cd my-smart-function && genaiz sf build
      - name: Publish
        run: genaiz sn publish
```

## Inputs

### genaiz-cli-token

By default, this will be set to `github.token` and should not be overridden for public repositories. In the event that
the CLI's access is restricted, this can be set to
a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
with `Contents` permission allowing
reading releases from the [genaiz-cli](https://www.github.com/GenAIz/sdk).

### genaiz-cli-version

By default, the action will download the latest version of the CLI. If the CLI version needs to be pinned on a specific
version, this should match a tag version in the [genaiz-cli](https://www.github.com/GenAIz/sdk) repository without the '
v' prefix.

### genaiz-url

The FQDN or the URL of a running GenAIz Orchestrator. This is required.

### genaiz-session

Optionally provide a session token to override any pre-authenticated session on the Runner. This should always be passed
from secrets. If no session token is provided, the action will attempt activating a session on the provided URL. If no
sessions have been established the step will fail.

## Outputs

### genaiz-version

The action will set the version it installed in the `genaiz-version` variable, which can later be accessed with
`${{ steps.<id>.outputs.genaiz-version }}`

### genaiz-auth

This is a boolean indicating whether the action was able to authenticate or not. Normally the step will fail on an auth
failure, but in the event, that the step is configured with `continue-on-error: true`, this flag can be used to direct
the job steps.


&copy; 2018 - 2026 GenAIz. All rights reserved.
