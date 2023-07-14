import {Client} from "@concurrent-world/client";
import moment from "moment";
import axios from "axios";

const CONCURRENT_REPO_API = "https://api.github.com/repos/totegamma/concurrent-web";

// concurrent settings
const userAddress = process.env.CCID;
const privateKey = process.env.PRIVATE_KEY;
const host = process.env.CONCURRENT_HOST;
const clientSig = "concurrent-dev-progress-report-bot";

// github settings
const githubToken = process.env.GITHUB_TOKEN;

const postStreams = process.env.CONCURENT_POST_STREAMS.split(',');

const client = new Client(userAddress, privateKey, host, clientSig);

// await client.createCurrent("Hello", postStreams)

const oneDayAgo = moment().subtract(1, 'days')

const getCommitDetails = async () => {
    const {data} = await axios.get(CONCURRENT_REPO_API + '/commits?sha=develop', {
        headers: {
            Authorization: `Bearer ${githubToken}`
        }
    })

    const oneDayCommits = data.filter(commit => {
        const commitDate = moment(commit.commit.author.date)
        return commitDate.isAfter(oneDayAgo)
    })

    const commitWithDetails = []
    for (const commit of oneDayCommits) {
        const commitDetailsResponse = await axios.get(commit.url, {
            headers: {
                Authorization: `Bearer ${githubToken}`
            }
        });
        const commitDetails = commitDetailsResponse.data;
        commitWithDetails.push({
            ...commit,
            details: commitDetails
        })
    }
    return commitWithDetails;
}


const getIssues = async () => {
    const {data} = await axios.get(CONCURRENT_REPO_API + '/issues', {
        headers: {
            Authorization: `Bearer ${githubToken}`
        },
        params: {
            state: 'all',
            since: oneDayAgo
        }
    })
    return data;
}

const getPullRequests = async () => {
    const {data} = await axios.get(CONCURRENT_REPO_API + '/issues', {
        headers: {
            Authorization: `Bearer ${githubToken}`
        },
        params: {
            state: 'all',
            since: oneDayAgo.toISOString()
        }
    })
    return data;
}

const commits = await getCommitDetails();
const issues = await getIssues();
const pullRequests = await getPullRequests();

const commitsDetails = commits.map(commit => {
    return {
        author: commit.details.commit.author.name,
        additions: commit.details.stats.additions,
        deletions: commit.details.stats.deletions
    }
})

// authorが一緒だったら additionとdeletionをまとめる
const commitsDetailsGroupByAuthor = commitsDetails.reduce((acc, cur) => {
    const author = cur.author;
    if (acc[author]) {
        acc[author].additions += cur.additions;
        acc[author].deletions += cur.deletions;
    } else {
        acc[author] = cur;
    }
    return acc;
}, {})


const issuesDetails = issues.filter(i => i.node_id.startsWith("I")).map(issue => {
    return {
        state: issue.state,
        number: issue.number,
        title: issue.title
    }
})


const pullRequestsDetails = pullRequests.filter(i => i.node_id.startsWith("P")).map(pr => {
    return {
        state: pr.state,
        number: pr.number,
        title: pr.title
    }
})

const messageText = `

\`\`\`diff
# Concurrent Dev Progress Report
## Commits
${Object.entries(commitsDetailsGroupByAuthor).map(([author, commit]) => {
    return `@${commit.author}
+ ${commit.additions}
- ${commit.deletions}
    `
}).join('\n')}
## Issues
${issuesDetails.map(issue => {
    return `${issue.state} #${issue.number} ${issue.title}`
}).join('\n')}

## Pull Requests
${pullRequestsDetails.map(pr => {
    return `${pr.state} #${pr.number} ${pr.title}`
}).join('\n')}

\`\`\`
`


await client.createCurrent(messageText, postStreams)
