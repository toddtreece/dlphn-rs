import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Header } from 'semantic-ui-react';
import { History } from 'history';

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
      <Header as="h1">dlphn.streams</Header>
      <Table celled selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>id</Table.HeaderCell>
            <Table.HeaderCell>key</Table.HeaderCell>
            <Table.HeaderCell>created</Table.HeaderCell>
            <Table.HeaderCell>updated</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && data.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={4}>loading...</Table.Cell>
            </Table.Row>
          )}
          {data.map((stream: Stream) => (
            <Table.Row key={stream.id} onClick={() => history.push(`/streams/${stream.key}/data`)}>
              <Table.Cell>{stream.id}</Table.Cell>
              <Table.Cell>{stream.key}</Table.Cell>
              <Table.Cell>{stream.created}</Table.Cell>
              <Table.Cell>{stream.updated}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
};
