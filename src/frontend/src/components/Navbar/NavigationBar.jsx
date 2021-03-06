import React from "react";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar, Typography, withStyles } from "@material-ui/core";
import { ToastContainer } from "react-toastify";
import { UserButton } from "./UserDropdown";

const styles = {
  flex: {
    flexGrow: 1
  }
};

const devDivStyle = {
  fontSize: "1rem",
  height: "2rem",
  paddingBottom: "0.5rem",
  paddingTop: "0.5rem",
  fontWeight: "bold",
  color: "#606060",
  textAlign: "center",
  verticalAlign: "middle",
  background: "#ffdb4d"
};

const NavigationBar = props => {
  const { classes } = props;
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" color="inherit" className={classes.flex}>
          Discovery API Assistant Demo
        </Typography>
        <UserButton />
      </Toolbar>
      <ToastContainer className="toast-container" />
      {process.env.NODE_ENV !== "production" && (
        <div style={devDivStyle}>DEVELOPMENT MODE</div>
      )}
    </AppBar>
  );
};

const styledNavBar = withStyles(styles)(NavigationBar);
export { styledNavBar as NavigationBar };
