import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import GroupsNavigation from './GroupsNavigation/GroupsNavigation';

import { createGroupActivities, updateScrambleSetCount, assignTasks } from '../../../logic/groups';
import { roundGroupActivities, roundsMissingAssignments } from '../../../logic/activities';

export default class GroupsManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localWcif: props.wcif
    };
  }

  createGroupActivities = () => {
    const { localWcif } = this.state;
    this.setState({
      localWcif: updateScrambleSetCount(createGroupActivities(localWcif))
    });
  };

  assignTasks = () => {
    const { localWcif } = this.state;
    const start = performance.now();
    const wcifWithAssignments = assignTasks(localWcif);
    console.log(wcifWithAssignments, 'Took', performance.now() - start);
    this.setState({ localWcif: wcifWithAssignments });
  };

  render() {
    const { localWcif } = this.state;
    const { onWcifUpdate } = this.props;

    const groupsCreated = localWcif.events.every(event =>
      event.rounds.every(round =>
        roundGroupActivities(localWcif, round.id).length > 0
      )
    );

    return (
      <Grid container spacing={8} justify="flex-end">
        <Grid item xs={12}>
          {!groupsCreated && (
            <SnackbarContent
              style={{ maxWidth: 'none' }}
              message="To assign tasks you need to create groups first. This will also determine scramble set count for each round."
              action={
                <Button onClick={this.createGroupActivities} color="secondary" size="small">
                  Create groups
                </Button>
              }
            />
          )}
          {(groupsCreated && roundsMissingAssignments(localWcif).length > 0) && (
            <SnackbarContent
              style={{ maxWidth: 'none' }}
              message="There are rounds with no tasks assigned."
              action={
                <Button onClick={this.assignTasks} color="secondary" size="small">
                  Assign tasks
                </Button>
              }
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <GroupsNavigation wcif={localWcif} />
        </Grid>
        <Grid item>
          <Button variant="contained" component={Link} to={`/competitions/${localWcif.id}`}>
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onWcifUpdate(localWcif)}
            component={Link}
            to={`/competitions/${localWcif.id}`}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    );
  }
}
