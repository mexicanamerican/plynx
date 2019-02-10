// src/components/NotFound/index.js
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Dialog from './Dialog.js'
import NodeItem from '../Common/NodeItem.js'
import { PLynxApi } from '../../API.js';
import { ACTION } from '../../constants.js';

import './DeprecateDialog.css';

export default class DeprecateDialog extends Component {

  constructor(props) {
    super(props);

    var prev_node_loading = false;
    var new_node_loading = false;
    var prev_node_id = '';
    var new_node_id = '';

    if (!this.props.prev_node && this.props.prev_node_id) {
      this.updateNode(this.props.prev_node_id, 'prev_node');
      prev_node_loading = true;
      prev_node_id = this.props.prev_node_id;
    } else if (this.props.prev_node) {
      prev_node_id = this.props.prev_node._id;
    }

    if (!this.props.new_node && this.props.new_node_id) {
      this.updateNode(this.props.new_node_id, 'new_node');
      new_node_loading = true;
      new_node_id = this.props.new_node_id;
    } else if (this.props.new_node) {
      new_node_id = this.props.new_node._id;
    }

    this.state = {
      prev_node: this.props.prev_node,
      prev_node_loading: prev_node_loading,
      prev_node_id: prev_node_id,
      new_node: this.props.new_node,
      new_node_loading: new_node_loading,
      new_node_id: new_node_id
    }
  }

  updateNode(node_id, destination, retryCount = 3) {
    console.log("update_node");
    var self = this;
    PLynxApi.endpoints.nodes.getOne({ id: node_id})
    .then(function (response) {
      var node = response.data.data;
      self.setState({[destination]: node});
      self.setState({[destination + '_id']: node._id});
      self.setState({[destination + '_loading']: false});
    })
    .catch(function (error) {
      console.error(error);
      if (error.response.status === 404) {
        self.setState({[destination + '_loading']: false})
      }
      if (error.response.status === 401) {
        PLynxApi.getAccessToken()
        .then(function (isSuccessfull) {
          if (!isSuccessfull) {
            self.setState({[destination + '_loading']: false});
          } else {
            if (retryCount > 0) {
              self.updateNode(node_id, destination, retryCount - 1);
              self.setState({[destination + '_loading']: true});
            } else {
              self.setState({[destination + '_loading']: false});
            }
          }
        });
      }
    });
  }

  handleDeprecate(mode) {
    var node = this.state.prev_node;
    var new_node = this.state.new_node;
    if (new_node) {
      node.successor_node = new_node._id;
    }
    if (mode === 'optionally') {
      this.props.onDeprecate(node, ACTION.DEPRECATE);
    } else if (mode === 'mandatory') {
      this.props.onDeprecate(node, ACTION.MANDATORY_DEPRECATE);
    }

    this.props.onClose();
  }

  handleCancel() {
    if (this.props.onNo) {
      this.props.onCancel();
    }
    this.props.onClose();
  }

  handleNewNodeIdChange(event) {
    this.setState({new_node_id: event.target.value});
    if (event.target.value.length === 24) {
      this.updateNode(event.target.value, 'new_node');
      this.setState({
        new_node_loading: true
      })
    } else {
      this.setState({
        new_node: null,
        new_node_loading: false
      })
    }
  }

  render() {
    return (
      <Dialog className='DeprecateDialog'
              onClose={() => {this.props.onClose()}}
              width={600}
              height={250}
              title={'Deprecation'}
              enableResizing={false}
      >
        <div className='DeprecateDialog'>
          <div className='MainBlock'>

            <div className='Title'>
              {this.props.title}
            </div>

            <hr/>

            <div className='Row'>
              <div className='Col'>
                <div>
                  Id:
                </div>
                <Link to={'/nodes/' + this.state.prev_node_id}>
                    {this.state.prev_node_id}<img src="/icons/external-link.svg" width="12" height="12" alt="link" />
                    </Link>
              </div>

              <div className='Divider'>

              </div>

              <div className='Col'>
                <div>
                  Id:
                </div>
                <input className='Cell'
                        type="text"
                        onChange={(event) => this.handleNewNodeIdChange(event)}
                        value={this.state.new_node_id}
                        />
              </div>
            </div>

            <div className='Row'>
              <div className='Prev'>
                { this.state.prev_node &&
                  <NodeItem
                    node={this.state.prev_node}
                  />
                }
                { this.state.prev_node_loading &&
                  "Loading..."
                }
                { !this.state.prev_node && !this.state.prev_node_loading &&
                  "Not found"
                }
              </div>

              <div className='Divider'>
               <img src="/icons/chevron-right-2x.png" className='arrow' alt="arrow" />
              </div>

              <div className='New'>
              { this.state.new_node &&
                <NodeItem
                  node={this.state.new_node}
                />
              }
              { this.state.new_node_loading &&
                "Loading..."
              }
              { !this.state.new_node && !this.state.new_node_loading &&
                "Not found"
              }
              </div>
            </div>

          </div>

          <div className='Controls'>
            <a href={null}
               onClick={(e) => {e.preventDefault(); this.handleDeprecate('optionally')}}
               className="control-button">
               <img src="/icons/alert-circle.svg" alt="deprecate" /> Deprecate (optionally)
            </a>
            <a href={null}
               onClick={(e) => {e.preventDefault(); this.handleDeprecate('mandatory')}}
               className="control-button">
               <img src="/icons/alert-octagon.svg" alt="deprecate" /> Deprecate (mandatory)
            </a>
            <a href={null}
               onClick={(e) => {e.preventDefault(); this.handleCancel()}}
               className="control-button">
               <img src="/icons/x.svg" alt="cancel" /> Cancel
            </a>
          </div>
        </div>
      </Dialog>
    );
  }
}
