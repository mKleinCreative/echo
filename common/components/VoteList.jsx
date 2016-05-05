import React, {Component, PropTypes} from 'react'

import {List, ListItem, ListSubHeader, ListDivider} from 'react-toolbox/lib/list'

import {CYCLE_STATES} from '../validations/cycle'
import Vote from './Vote'

import styles from './VoteList.css'

export default class VoteList extends Component {
  render() {
    const {chapter, cycle, votes} = this.props

    const title = `Cycle ${cycle.cycleNumber} Votes (${chapter.name})`
    const voteList = votes.map((vote, i) => {
      return <Vote key={i} vote={vote}/>
    })

    return (
      <List>
        <ListSubHeader caption={title}/>
        {voteList}
        <ListDivider/>
        <ListItem
          leftIcon="book"
          >
          <a className={styles.link} href={chapter.goalRepositoryURL} target="_blank">
            View Goal Library
          </a>
        </ListItem>
      </List>
    )
  }
}

VoteList.propTypes = {
  chapter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    goalRepositoryURL: PropTypes.string.isRequired,
  }).isRequired,

  cycle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    cycleNumber: PropTypes.number.isRequired,
    startTimestamp: PropTypes.instanceOf(Date).isRequired,
    state: PropTypes.oneOf(CYCLE_STATES),
  }).isRequired,

  votes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    playerIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    goal: PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
}
