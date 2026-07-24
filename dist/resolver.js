import * as github from "@actions/github";
import { createUnauthenticatedAuth } from "@octokit/auth-unauthenticated";
export class Resolver {
    static owner = "GenAIz";
    static repo = "sdk";
    octokit;
    version;
    constructor(token, version) {
        console.log("token length: ", token.length);
        this.octokit = token
            ? github.getOctokit(token)
            : github.getOctokit("", {
                authStrategy: createUnauthenticatedAuth({
                    reason: "no 'genaiz-cli-token' input"
                }),
                auth: {}
            });
        this.version = version;
    }
    resolvePackage() {
        return "";
    }
    async resolveVersion() {
        let result;
        if (this.version === "latest") {
            const { data } = await this.octokit.rest.repos.getLatestRelease({
                owner: Resolver.owner,
                repo: Resolver.repo,
            });
            result = data.tag_name.slice(1);
        }
        else {
            result = "1.0.0";
        }
        return result;
    }
}
