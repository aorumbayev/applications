import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import PipelinesTable from "./PipelinesTable";
import { addPipelines } from "../../_actions/pipelines";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  postDiscoverFromTtl,
  postDiscoverFromUriList,
  getPipelineGroups
} from "../../_services/discovery.service";
import {
  removeSingleSource,
  addMultipleSources
} from "../../_actions/datasources";
import { url_domain, replaceAll } from "../../_helpers/utils";
import {
  getDatasourcesArray,
  getDatasourcesForTTLGenerator
} from "../../selectors/datasources";
import LinearLoadingIndicator from "../Loaders/LinearLoadingIndicator";

const styles = theme => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing.unit * 20,
    flex: 1
  },
  button: {
    margin: theme.spacing.unit
  },
  input: {
    display: "none"
  },
  card: {
    flexGrow: 1
  },
  chip: {
    margin: theme.spacing.unit / 2
  }
});

class SelectSources extends React.Component {
  state = {
    ttlFile: undefined,
    discoveryId: "",
    discoveryIsLoading: false,
    pipelinesDialogOpen: false,
    textFieldValue: "",
    textFieldIsValid: false
  };

  handleClose = () => {
    this.setState({
      pipelinesDialogOpen: false
    });
  };

  onChange = e => {
    toast.success("File uploaded", { autoClose: 1500 });
    this.setState({ ttlFile: e.target.files[0] });
  };

  postStartFromFile = () => {
    let tid = toast.info("Running the discovery...", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: false
    });

    const self = this;
    postDiscoverFromTtl({ ttlFile: self.state.ttlFile })
      .then(
        function(response) {
          return response.json();
        },
        function(err) {
          toast.update(tid, {
            render: "There was an error during the discovery",
            type: toast.TYPE.ERROR,
            autoClose: 2000
          });
          self.setState({ discoveryIsLoading: false });
        }
      )
      .then(function(jsonResponse) {
        if (toast.isActive(tid)) {
          toast.update(tid, {
            render: `Discovery id ${jsonResponse.id}`,
            type: toast.TYPE.SUCCESS,
            autoClose: 2000
          });
        } else {
          toast.success(`Discovery id ${jsonResponse.id}`, { autoClose: 2000 });
        }

        self.setState({
          discoveryId: jsonResponse.id,
          discoveryIsLoading: false
        });
      });
  };

  // TODO: refactor later, move to separate class responsible for _services calls
  postStartFromInputLinks = () => {
    const { datasourcesForTTL } = this.props;

    let tid = toast.info("Getting the pipeline groups...", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: false
    });

    const self = this;
    postDiscoverFromUriList({ datasourceUris: datasourcesForTTL })
      .then(
        function(response) {
          return response.json();
        },
        function(err) {
          toast.update(tid, {
            render: "There was an error during the discovery",
            type: toast.TYPE.ERROR,
            autoClose: 2000
          });
          self.setState({ discoveryIsLoading: false });
        }
      )
      .then(function(jsonResponse) {
        if (toast.isActive(tid)) {
          toast.update(tid, {
            render: `Discovery id ${jsonResponse.id}`,
            type: toast.TYPE.SUCCESS,
            autoClose: 2000
          });
        } else {
          toast.success(`Discovery id ${jsonResponse.id}`, { autoClose: 2000 });
        }

        self.setState({
          discoveryId: jsonResponse.id,
          discoveryIsLoading: false
        });
      });
  };

  processStartDiscovery = () => {
    console.log(process.env.BASE_BACKEND_URL);

    this.setState({ discoveryIsLoading: true });
    if (this.state.ttlFile) {
      this.postStartFromFile();
    } else {
      this.handleAddSources();
      setTimeout(() => {
        this.postStartFromInputLinks();
      }, 500);
    }
  };

  loadPipelineGroups = () => {
    let tid = toast.info("Getting the pipeline groups...", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: false
    });

    const self = this;
    getPipelineGroups({ discoveryId: self.state.discoveryId })
      .then(
        function(response) {
          return response.json();
        },
        function(err) {
          toast.update(tid, {
            render: "Error getting pipeline groups",
            type: toast.TYPE.ERROR,
            autoClose: 2000
          });
        }
      )
      .then(function(jsonResponse) {
        toast.dismiss(tid);
        self.props.dispatch(
          addPipelines({ pipelinesArray: jsonResponse.pipelines })
        );

        self.setState({
          pipelinesDialogOpen: true
        });
      });
  };

  handleAddSources = () => {
    let input = this.state.textFieldValue;

    if (!(typeof input === "string" || input instanceof String)) {
      return;
    }

    let links = input.split(",\n");
    let sourcesList = [];

    links.forEach(function(link) {
      if (link !== "") {
        const domainName = url_domain(link);
        sourcesList.push({ name: domainName, url: link });
      }
    });

    this.props.dispatch(addMultipleSources({ sourcesList: sourcesList }));
  };

  // TODO: refactor
  // handleDeleteSource = chip => {
  //   this.props.dispatch(removeSingleSource({ url: chip }));
  // };

  validateField = e => {
    let rawText = e.target.value;
    const regex = /(?:http|https):\/\/((?:[\w-]+)(?:\.[\w-]+)+)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gm;
    let matches = rawText.match(regex);
    let valid = false;

    if (matches instanceof Array) {
      rawText = matches.join(",\n");
      valid = true;
    }

    this.setState({
      textFieldValue: rawText,
      textFieldIsValid: valid
    });
  };

  render() {
    const { classes, datasources } = this.props;

    const {
      discoveryId,
      pipelinesDialogOpen,
      discoveryIsLoading,
      textFieldValue,
      textFieldIsValid
    } = this.state;

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="title" component="h1">
            Add Data Sources
          </Typography>
          <TextField
            id="outlined-textarea"
            label="Sources validator"
            multiline
            value={textFieldValue}
            onChange={this.validateField}
            placeholder="Input your sources..."
            fullWidth
            margin="normal"
            variant="outlined"
          />
        </CardContent>

        <CardActions>
          {discoveryIsLoading ? (
            <LinearLoadingIndicator labelText="Processing sources through Discovery, hang in there 😉" />
          ) : (
            <div>
              {/*
              <input
                accept=".ttl"
                className={classes.input}
                onChange={this.onChange}
                id="contained-button-file"
                type="file"
              />
              <label htmlFor="contained-button-file">
                <Button
                  variant="contained"
                  component="span"
                  className={classes.button}
                  size="small"
                >
                  Select TTL file
                </Button>

              </label>
             */}
              <Button
                variant="contained"
                component="span"
                className={classes.button}
                disabled={!this.state.ttlFile && !textFieldIsValid}
                onClick={this.processStartDiscovery}
                size="small"
              >
                Start
              </Button>
              <Dialog
                fullWidth={true}
                maxWidth="md"
                open={pipelinesDialogOpen}
                onClose={this.handleClose}
              >
                <DialogTitle>
                  <Typography variant="headline" gutterBottom>
                    Pipelines Browser
                  </Typography>
                </DialogTitle>
                <DialogContent>
                  <Typography variant="body1">
                    Each discovered pipeline presents a sequence of
                    transformations that have to be applied to the data so that
                    it can be visualized using this visualizer. Notice that
                    different pipelines will give different outputs. You need to
                    try them manually.
                  </Typography>
                  <p>
                    <Typography variant="body2">
                      To create an application, first run a pipeline from the
                      table below.
                    </Typography>
                  </p>
                  <PipelinesTable discoveryId={discoveryId} />
                </DialogContent>
                <DialogActions>
                  <Button color="primary" onClick={this.handleClose}>
                    OK
                  </Button>
                </DialogActions>
              </Dialog>
              <Button
                variant="contained"
                component="span"
                className={classes.button}
                disabled={!this.state.discoveryId}
                onClick={this.loadPipelineGroups}
                size="small"
              >
                Browse Pipelines
              </Button>
            </div>
          )}
        </CardActions>
      </Card>
    );
  }
}

SelectSources.propTypes = {
  classes: PropTypes.object.isRequired
};

const mapStateToProps = state => {
  return {
    datasources: getDatasourcesArray(state.datasources),
    datasourcesForTTL: getDatasourcesForTTLGenerator(state.datasources)
  };
};

export default connect(mapStateToProps)(withStyles(styles)(SelectSources));
