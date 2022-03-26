// Packages
import { Probot } from "probot";

// Ours
import toggle from "./toggle";
// import update from "./update";

export = (app: Probot) => {
	// Toggle label
	app.on("pull_request.opened", toggle);
	app.on("pull_request.edited", toggle);

	// app.on("issues.edited", toggle);
	// app.on("issues.opened", toggle);

	// Re-check on dependency updates
	// app.on("issues.closed", update);
	// app.on("issues.reopened", update);
	app.on("pull_request.reopened", toggle);
	// app.on("pull_request.closed", update);
	app.on("pull_request.synchronize", toggle);

	// Index page
	// app.route("/").get("/", (_, res) => {
	// 	res.sendFile(join(__dirname, "..", "index.html"));
	// });
};
