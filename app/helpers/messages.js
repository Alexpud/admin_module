const messages = {
	CONTAINER_ALREADY_EXISTS:{ error: "Container already exists"},
	CONTAINER_DOES_NOT_EXIST:{ error: "Container does not exist"},
	CONTAINER_DOES_NOT_HAVE_WORKSPACES:{error: "Container doesn't have workspaces"},
	CONTAINER_MUST_BE_RUNNING: {error: "Container must be running"},
	WORKSPACE_ALREADY_EXISTS: {error: "Workspace already exists"},
	WORKSPACE_CREATION_FAILED: {error: "Was not able to create workspace"},
	WORKSPACE_NOT_FOUND: {error: "Workspace not found"},
	WORKSAPCE_STOP_SUCCESS: {response:"Workspace successfully stopped"}
};

module.exports = messages;