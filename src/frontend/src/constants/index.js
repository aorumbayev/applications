import { getQueryString } from "../utils";

const BASE_URL = "http://localhost:8080/";
const PIPELINES_URL = BASE_URL + "pipelines/";
const PIPELINE_URL = BASE_URL + "pipeline/";
const DISCOVERY_URL = BASE_URL + "discovery/";
const EXECUTION_URL = BASE_URL + "execution/";

export const DISCOVER_FROM_INPUT_URL = PIPELINES_URL + "discoverFromInput";
export const DISCOVER_FROM_URI_LIST_URL = PIPELINES_URL + "discover";
export const PIPELINE_GROUPS_URL = discoveryId => {
  return DISCOVERY_URL + discoveryId + "/pipelineGroups";
};
export const EXECUTE_PIPELINE_URL = (discoveryId, pipelineId) => {
  return discoveryId && pipelineId
    ? PIPELINE_URL +
        "export?" +
        getQueryString({ discoveryId: discoveryId, pipelineUri: pipelineId })
    : "";
};
export const EXECUTION_STATUS_URL = executionIri => {
  return EXECUTION_URL + "?" + getQueryString({ executionIri: executionIri });
};