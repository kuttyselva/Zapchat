import React, { Component } from 'react'
import { Segment, Header, Icon, Input } from 'semantic-ui-react'

export default class MessagesHeader extends Component {
    render() {
        return (
            <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
                    <span>
                        Channel Title
              <Icon name={"star outline"} color="black" />
                    </span>
                    <Header.Subheader>
                        2 users
                    </Header.Subheader>
                </Header>
                {/* Channel search input */}
                <Header floated="right" fluid="true">
                    <Input size="mini" icon="search" name="searchTerm" placeholder="Search Meassages" />
                </Header>
            </Segment>
        )
    }
}
