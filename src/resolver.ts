import semver from "semver";
import * as github from "@actions/github";
import { getOctokit } from '@actions/github';
import {createUnauthenticatedAuth} from "@octokit/auth-unauthenticated";

type Octokit = ReturnType<typeof getOctokit>;

export class Resolver {
    private static owner = "GenAIz"
    private static repo = "sdk"

    private octokit: Octokit
    private readonly version: string

    constructor(token: string, version: string) {
        console.log("token length: ", token.length)
        this.octokit = token
            ? github.getOctokit(token)
            : github.getOctokit("", {
                authStrategy: createUnauthenticatedAuth({
                    reason: "no 'genaiz-cli-token' input"
                }),
                auth: {}
            });
        this.version = version
    }

    resolvePackage(): string {
        return ""
    }

    async resolveVersion(): Promise<string> {
        let result

        if (this.version === "latest") {
            const { data } = await this.octokit.rest.repos.getLatestRelease({
                owner: Resolver.owner,
                repo: Resolver.repo,
            });

            result = data.tag_name.slice(1)
        } else {
            result = "1.0.0"
        }

        return result
    }
}