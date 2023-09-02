# concurrent-progress-report-bot

![CI Badge](https://github.com/rassi0429/concurrent-progress-report-bot/actions/workflows/docker-build-release.yml/badge.svg)
![License MIT](https://img.shields.io/github/license/rassi0429/concurrent-progress-report-bot)

concurrentの今日の一日を投稿するBotです。

## helm repo

`https://rassi0429.github.io/helmcharts/`

## 環境変数

helmのvaluesも同じ名前になっています。

| 環境変数名                  | 説明                                   |
|------------------------|--------------------------------------|
| PRIVATE_KEY            | Concurrent Private key               |
| CONCURRENT_HOST        | Concurrent account host              |
| CONCURENT_POST_STREAMS | now listeningを流すストリームをカンマ区切りで入れてください |
| GITHUB_TOKEN           | GitHubのAPIキー（Read repoがついてればOK)      |
