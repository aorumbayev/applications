import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Typography from "@material-ui/core/Typography";
import ReactJson from "react-json-view";
import { withStyles } from "@material-ui/core/styles";
import withRoot from "./withRoot";
import "whatwg-fetch";
import PipelinesTable from "./PipelinesTable";
import { addPipelines } from "../actions/pipelines";

const styles = theme => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing.unit * 20
  },
  button: {
    margin: theme.spacing.unit
  },
  input: {
    display: "none"
  }
});

class AssistantDemoPage extends React.Component {
  state = {
    ttlFile: undefined,
    discoveryId: "",
    discoveryDialogOpen: false,
    pipelinesDialogOpen: false
  };

  handleClose = () => {
    this.setState({
      discoveryDialogOpen: false,
      pipelinesDialogOpen: false
    });
  };

  onChange = e => {
    console.log("got file");
    this.setState({ ttlFile: e.target.files[0] });
  };

  postStartFromInput = () => {
    const url = "http://localhost:8080/pipelines/discoverFromInput";
    const self = this;
    fetch(url, {
      method: "POST",
      body: this.state.ttlFile,
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(
        function(response) {
          return response.json();
        },
        function(error) {
          console.log(error);
          error.message; //=> String
        }
      )
      .then(function(jsonResponse) {
        self.setState({
          discoveryId: jsonResponse.ID,
          discoveryDialogOpen: true
        });
      });
  };

  getPipelineGroups = () => {
    const url =
      "http://localhost:8080/discovery/" +
      this.state.discoveryId +
      "/pipelineGroups";
    console.log(url);
    const self = this;
    fetch(url)
      .then(
        function(response) {
          return response.json();
        },
        function(error) {
          console.log(error);
          error.message; //=> String
        }
      )
      .then(function(jsonResponse) {
        console.log(jsonResponse.pipelines);
        console.log("here we go");
        self.props.dispatch(
          addPipelines({ pipelinesArray: jsonResponse.pipelines })
        );

        self.setState({
          pipelinesDialogOpen: true
        });
      });
  };

  render() {
    const { classes } = this.props;
    const {
      discoveryDialogOpen,
      discoveryId,
      pipelinesDialogOpen
    } = this.state;

    return (
      <header>
        <div className={classes.root}>
          <Dialog open={discoveryDialogOpen} onClose={this.handleClose}>
            <DialogTitle>Discovery Response</DialogTitle>
            <DialogContent>
              <DialogContentText>Your id is : {discoveryId}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.handleClose}>
                OK
              </Button>
            </DialogActions>
          </Dialog>

          <Typography variant="display1" gutterBottom>
            Select TTL config file
          </Typography>

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
            >
              Upload
            </Button>
          </label>

          <Button
            variant="contained"
            component="span"
            className={classes.button}
            disabled={!this.state.ttlFile}
            onClick={this.postStartFromInput}
          >
            Start
          </Button>
          <Dialog open={pipelinesDialogOpen} onClose={this.handleClose}>
            <DialogTitle>Pipelines Response</DialogTitle>
            <DialogContent>
              <PipelinesTable />
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.handleClose}>
                OK
              </Button>
            </DialogActions>
          </Dialog>

          <Typography variant="display1" gutterBottom>
            Get pipeline groups
          </Typography>

          <Button
            variant="contained"
            component="span"
            className={classes.button}
            disabled={!this.state.discoveryId}
            onClick={this.getPipelineGroups}
          >
            Start
          </Button>
        </div>
      </header>
    );
  }
}

AssistantDemoPage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default connect()(withRoot(withStyles(styles)(AssistantDemoPage)));
