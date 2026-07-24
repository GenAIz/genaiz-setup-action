import * as crypto from 'crypto'
import * as fs from 'node:fs/promises'
import * as github from '@actions/github';
import * as path from 'path'
import * as os from 'os'

import semver from 'semver';
import * as tc from '@actions/tool-cache';
import {getOctokit} from '@actions/github';
import {createUnauthenticatedAuth} from '@octokit/auth-unauthenticated';

type Octokit = ReturnType<typeof getOctokit>;

export class Resolver {
    private static owner = "GenAIz"
    private static repo = "sdk"

    private readonly version: string
    private octokit: Octokit

    constructor(token: string, version: string) {
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

    async downloadAsset(assetUrl: string, fileName: string): Promise<string> {
        const destPath = path.join(os.tmpdir(), `download-${process.pid}-${Date.now()}-${fileName}`)
        const r = await this.octokit.request("GET {+url}",{
            url: assetUrl,
            headers: {
                Accept: 'application/octet-stream'
            }
        })

        let data = r.data;

        if (data instanceof ArrayBuffer) {
            data = Buffer.from(data);
        }

        console.log("Writing file: ", destPath, "size: ", data.length)
        await fs.writeFile(destPath, data);
        return destPath
    }

    async resolvePackage(version: string): Promise<string> {
        let path = tc.find('genaiz', version);

        if (!path) {
            const {data} = await this.octokit.rest.repos.getReleaseByTag({
                owner: Resolver.owner,
                repo: Resolver.repo,
                tag: `v${version}`
            })
            let toolPath = ''
            let sumPath = ''

            for (const asset of data.assets ?? []) {
                if (asset.name.endsWith(`genaiz-${version}.tar.gz`)) {
                    toolPath = await this.downloadAsset(asset.url, asset.name)

                } else if (asset.name.endsWith(`genaiz-${version}.tar.gz.sha256`)) {
                    sumPath = await this.downloadAsset(asset.url, asset.name)
                }
            }

            if (toolPath == '') {
                throw new Error(`could not find asset url for tag v${version}`)
            }

            if (sumPath == '') {
                throw new Error('could not verify asset integrity without a sha256 checksum')
            }

            const toolData = await fs.readFile(toolPath)
            const sumData = await fs.readFile(sumPath, "utf-8")
            const hash = crypto.createHash('sha256')

            hash.update(toolData)
            const toolHash = hash.digest('hex')
            const sumHash = sumData.split(" ")[0]

            if (toolHash === sumHash) {
                let binPath = await tc.extractTar(toolPath)

                path = await tc.cacheDir(binPath, 'genaiz', version)
            } else {
                throw new Error(`checksums do not match: ${toolHash} != ${sumHash}`)
            }
        }

        return path
    }

    async resolveVersion(): Promise<string> {
        let result

        if (this.version === "latest") {
            const {data} = await this.octokit.rest.repos.getLatestRelease({
                owner: Resolver.owner,
                repo: Resolver.repo,
            });

            result = data.tag_name.slice(1)
        } else {
            const releases = await this.octokit.paginate(
                this.octokit.rest.repos.listReleases, {
                    owner: Resolver.owner,
                    repo: Resolver.repo,
                }
            );
            const versions = releases.map((release) =>
                release.tag_name.slice(1));

            result = semver.maxSatisfying(versions, this.version);

            if (result == null) {
                throw new Error(`could not find a version for ${this.version}`)
            }
        }

        return result
    }
}
