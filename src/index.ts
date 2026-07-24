import * as core from "@actions/core";
import {Resolver} from "./resolver.js"

const cliToken = core.getInput("genaiz-cli-token")
const versionArg = core.getInput("genaiz-version")
const sessionArg = core.getInput("orchestrator-session")
const sessionUrlArg = core.getInput("orchestrator-url")

async function main() {
    const resolver = new Resolver(cliToken, versionArg);
    const version = await resolver.resolveVersion()
    const packageUrl = resolver.resolvePackage()

    console.log("Resolved version: ", version)
}

main().catch(err => {
    core.setFailed(err instanceof Error ? err.message : String(err))
})
