# documentation-manager

> A GitHub App built with [Probot](https://github.com/probot/probot) to enforce docs to be updated as pull request is submited and needs minimum number of reviewer to approve the PR.


<img width="908" alt="Screenshot 2022-03-26 at 10 37 15 AM" src="https://user-images.githubusercontent.com/58116679/160225624-e74291de-f7e8-46b1-8817-b6f2de70ddec.png">

## Usage
1. **[Configure the Github App](https://github.com/apps/documentation-manager)**
2. Create ```.github/config.yml``` based on following template.
3. It will wait for docs file to be updated and reviewer to review it before marking them as ready to be merged.

A ```.github/config.yml``` file is required to enable the plugin.
```yaml

# Configuration for probot-min-reviews - https://github.com/hitesh-coder/documentation-manager
_extends: .github

# Number of reviews required to mark the pull request as valid
reviewsUntilReady: 1

# Number of changes in the pull request to start enforcing the reviewsUntilReady rule
changesThreshold: 100

# Message to display when the commit status passes
reviewReadyMessage: 'No pending reviews'
docsReadyMessage: "Document changed"

# Message to display when the commit status fails
reviewNotReadyMessage: 'Pending review approvals'
docsNotReadyMessage: "Please change document"

#list of documents needs to change
listOfDocFiles: ["docs.md"]

# Status to set the commit to when waiting for reviews
# 'failure, error, and pending' are the suggested options
notReadyState: 'pending'
```

## Setup

```sh
# Install dependencies
npm install

# Build th bot
npm run build

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t documentation-manager .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> documentation-manager
```

## Contributing

If you have suggestions for how documentation-manager could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 hitesh-coder <kotechahitesh517@gmail.com>
