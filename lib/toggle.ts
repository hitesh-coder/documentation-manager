// Packages
import { Context } from "probot";

// import { PullRequest } from "./types";

export default async function toggle(context: Context) {
  let config: any = await context.config("config.yml");

  // console.log("in toggle", typeof config);

  if (!config) {
    context.log(
      "%s missing configuration file",
      context.payload.repository.full_name
    );
    return;
  }

  const pullRequest = await getPullRequest(context);
  const approvals: any = await getReviewsWithState(context, "approved");
  const pendingReviewsCount = Math.max(0, config.reviewsUntilReady - approvals);
  // console.log("pendingReviewsCount", pendingReviewsCount);

  // const changesCount = pullRequest.additions + pullRequest.deletions;
  // console.log("changesCount", changesCount);

  // const isReadyToMerge =
  //   changesCount < config.changesThreshold || pendingReviewsCount === 0;
  const isReadyToMerge: boolean = pendingReviewsCount === 0;
  // console.log("isReadyToMerge", isReadyToMerge);

  const reviewState = isReadyToMerge ? "success" : config.notReadyState;
  // console.log("state", reviewState);
  const reviewDescription = isReadyToMerge
    ? config.reviewReadyMessage
    : config.reviewNotReadyMessage;

  // console.log("description", reviewDescription);

  // console.log("creating commit status");
  await context.octokit.repos.createCommitStatus(
    context.repo({
      sha: pullRequest.head.sha,
      state: reviewState,
      description: reviewDescription,
      context: "probot/minimum-reviews",
    })
  );

  const documentChanged: boolean = await isDocumentChanged(
    context,
    config.listOfDocFiles
  );

  const docsState = documentChanged ? "success" : config.notReadyState;

  const documentDescription = documentChanged
    ? config.docsReadyMessage
    : config.docsNotReadyMessage;

  if (!documentChanged) {
    const labelsToAdd = ["Docs needs to change"];
    await context.octokit.issues.addLabels(
      context.issue({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: context.payload.pull_request.number,
        labels: labelsToAdd,
      })
    );
  } else {
    try {
      // Remove it
      context.log("No dependencies found, removing the label");
      await context.octokit.issues.removeLabel({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: context.payload.pull_request.number,
        name: "Docs needs to change",
      });
    } catch (err) {
      // Nothing need to be done. Resolves (#14)
      context.log("The label doesn't exist. It's OK!");
    }
  }

  await context.octokit.repos.createCommitStatus(
    context.repo({
      sha: pullRequest.head.sha,
      state: docsState,
      description: documentDescription,
      context: "probot/docs-changed",
    })
  );
}

async function getPullRequest(context: Context) {
  const response = await context.octokit.rest.pulls.get({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.pull_request.number,
  });

  // console.log("getPullRequest", response.data);

  return response.data;
}

async function getReviewsWithState(context: Context, state: string) {
  // console.log("getReviews");
  const response = await context.octokit.rest.pulls.listReviews({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.pull_request.number,
  });

  // console.log(response.data);
  return response.data
    .map((review: any) => review.state)
    .filter((word: string) => word.toLowerCase() === state).length;
}

async function isDocumentChanged(context: Context, fileName: Array<string>) {
  const commitStat = await context.octokit.pulls.listFiles({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.pull_request.number,
  });

  // console.log("commitStat.data.files", commitStat);
  const namesOfFilesChanged: (string | undefined)[] | undefined =
    commitStat.data?.map((names) => names.filename);
  // console.log("namesOfFilesChanged", namesOfFilesChanged);
  let Status: boolean = false;

  namesOfFilesChanged?.map((name) => {
    for (let i = 0; i < fileName.length; i++) {
      if (name?.includes(fileName[i])) {
        Status = true;
      }
    }
  });

  return Status;
}
