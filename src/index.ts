import * as core from '@actions/core';
import {execa} from "execa";
import path from "node:path";

import {Resolver} from './resolver.js'
import {Session} from './session.js';

const cliToken = core.getInput('genaiz-cli-token')
const versionArg = core.getInput('genaiz-cli-version')
const sessionArg = core.getInput('genaiz-session')
const sessionUrlArg = core.getInput('genaiz-url')

async function main() {
    const resolver = new Resolver(cliToken, versionArg);
    const version = await resolver.resolveVersion()
    const binPath = await resolver.resolvePackage(version)

    core.info(`tag: ${version}`)
    core.info(`path: ${binPath}`)
    // Make sure the downloaded tool has precedence on anything already installed for the entire workflow
    core.exportVariable("PATH", `${binPath}${path.delimiter}${process.env.PATH}`)

    const {stdout} = await execa('genaiz', ['--version'])
    core.info(`installed version: ${stdout}`)

    if (sessionArg) {
        core.debug(`inspecting session for ${sessionUrlArg}`)
        await inspect(sessionUrlArg, sessionArg)
    } else {
        core.debug(`activating session for ${sessionUrlArg}`)
        await activate(sessionUrlArg)
    }
}

async function activate(url: string) {
    const {stdout} = await execa('genaiz', ['ac', 'inspect', url, '--json'])
    const raw = JSON.parse(stdout)

    if (raw.message) {
        throw Error(`GenAIz activate failed with: ${raw.message}`)
    }

    new Session(raw).validate(url)
    await execa('genaiz', ['ac', 'activate', url])
    core.info(`activated session for ${url} successfully`)
}

async function inspect(url: string, token: string) {
    // For the rest of the workflow, we override the auth for the Runner user
    core.exportVariable('GENAIZ_AUTH_URL', url)
    core.exportVariable('GENAIZ_AUTH_SESSION', token)

    const {stdout} = await execa('genaiz', ['ac', 'inspect', '--json'])
    const raw = JSON.parse(stdout)

    if (raw.message) {
        throw Error(`GenAIz inspect failed with: ${raw.message}`)
    }

    new Session(raw).validate(url)
    core.info(`overriding session for ${url}`)
}

main().catch(err => {
    core.setFailed(err instanceof Error ? err.message : String(err))
})
