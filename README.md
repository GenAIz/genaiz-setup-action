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

Example:

```yaml
name: publish-action.yml

on:
  workflow_dispatch:
    inputs:
      genaiz-cli-version:
        description: genaiz cli version, latest will be used if not provided
        required: false
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
      - name: Makefile build
        run: make genaiz-all
      - name: Makefile publish
        run: make genaiz-publish
```
