import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Breadcrumb, Popup, Label } from 'semantic-ui-react';
import { History } from 'history';
import moment from 'moment';

import { ApplicationState } from '../store';
import { Stream } from '../client';
import { fetchRequest } from '../store/streams/actions';

interface MainProps {
  history: History;
}

export const StreamsPage: React.FC<MainProps> = ({ history }) => {
  const { loading, data } = useSelector((state: ApplicationState) => state.streams);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRequest());
  }, [dispatch]);

  return (
    <>
      <Breadcrumb size="big">
        <Breadcrumb.Section>Streams</Breadcrumb.Section>
      </Breadcrumb>
      <Table celled selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>key</Table.HeaderCell>
            <Table.HeaderCell>last payload</Table.HeaderCell>
            <Table.HeaderCell>last insert</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && (
            <Table.Row>
              <Table.Cell colSpan={3}>loading...</Table.Cell>
            </Table.Row>
          )}
          {data.map((stream: Stream) => (
            <Table.Row key={stream.id} onClick={() => history.push(`/streams/${stream.key}/data`)}>
              <Table.Cell>{stream.key}</Table.Cell>
              <Table.Cell>
                <Label color="blue">
                  {Object.entries(stream.lastPayload || {})
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}
                </Label>
              </Table.Cell>
              <Table.Cell>
                <Popup
                  size="mini"
                  content={stream.lastInsert}
                  trigger={<span>{moment(stream.lastInsert).fromNow()}</span>}
                  inverted
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
};
