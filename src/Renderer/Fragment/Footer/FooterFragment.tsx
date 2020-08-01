import {shell} from 'electron';
import React from 'react';
import {StreamEvent} from '../../Event/StreamEvent';
import {SystemStreamEvent} from '../../Event/SystemStreamEvent';
import {StreamRepo} from '../../Repository/StreamRepo';
import {SystemStreamRepo} from '../../Repository/SystemStreamRepo';
import {DateUtil} from '../../Util/DateUtil';
import {VersionEvent} from '../../Event/VersionEvent';
import {StreamEntity} from '../../Type/StreamEntity';
import {SystemStreamEntity} from '../../Type/SystemStreamEntity';
import {RemoteVersionEntity} from '../../Type/RemoteVersionEntity';

interface State {
  lastStream: any;
  lastDate: Date;
  newVersion: RemoteVersionEntity;
}

export class FooterFragment extends React.Component<any, State> {
  state: State = {lastStream: null, lastDate: null, newVersion: null};

  componentDidMount() {
    SystemStreamEvent.onUpdateStream(this, this._updateTime.bind(this, 'system'));
    StreamEvent.onUpdateStream(this, this._updateTime.bind(this, 'stream'));
    VersionEvent.onNewVersion(this, (newVersion) => this.setState({newVersion}));
  }

  componentWillUnmount(): void {
    SystemStreamEvent.offAll(this);
    StreamEvent.offAll(this);
  }

  async _updateTime(type, streamId) {
    let stream: StreamEntity | SystemStreamEntity;

    switch (type) {
      case 'system':
        const res1 = await SystemStreamRepo.getSystemStream(streamId);
        stream = res1.systemStream;
        break;
      case 'stream':
        const res2 = await StreamRepo.getStream(streamId);
        stream = res2.stream;
        break;
      default:
        throw new Error(`unknown stream type: ${type}`);
    }

    this.setState({lastStream: stream, lastDate: new Date()})
  }

  _handleNewVersion() {
    shell.openExternal(this.state.newVersion.url);
  }

  render() {
    let lastStreamMessage;
    let hoverMessage;
    if (this.state.lastStream) {
      const lastDate = DateUtil.localToString(this.state.lastDate);
      lastStreamMessage = `Latest Connection: ${lastDate.split(' ')[1]}`;
      hoverMessage = `"${this.state.lastStream.name}" stream connection at ${lastDate}`;
    }

    let newVersion = '';
    if (this.state.newVersion) {
      newVersion = 'New Version'
    }

    return <footer className="toolbar toolbar-footer">
      <span className="flex-stretch"/>
      <span title={hoverMessage}>{lastStreamMessage}</span>
      <span className={`new-version-available ${newVersion? '': 'hidden'}`} onClick={this._handleNewVersion.bind(this)}>{newVersion}</span>
    </footer>
  }
}
