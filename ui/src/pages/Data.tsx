import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Header } from 'semantic-ui-react';
import { match } from 'react-router-dom';
import { History } from 'history';

import { ApplicationState } from '../store';
import { Data } from '../client';
import { fetchRequest } from '../store/data/actions';

interface RouteInfo {
  key: string;
}

interface MainProps {
  history: History;
  match: match<RouteInfo>;
}

export const DataPage: React.FC<MainProps> = props => {
  const {
    match: { params }
  } = props;
  const { loading, data } = useSelector((state: ApplicationState) => state.data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRequest(params.key));
  }, [dispatch]);

  const payloadColumnsSet = new Set(data.map((datum: Data) => Object.keys(datum.payload || {})).flat());
  const payloadColumns = [...payloadColumnsSet].sort();

  return (
    <>
      <Header as="h1">dlphn.streams.{params.key}</Header>
      {!loading && data.length === 0 && <div>not found.</div>}
      {data.length > 0 && (
        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>created</Table.HeaderCell>
              {payloadColumns.map((column: string) => (
                <Table.HeaderCell>{column}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data.map((datum: Data) => (
              <Table.Row key={datum.id} onClick={() => props.history.push(`/streams/${params.key}/data`)}>
                <Table.Cell>{datum.created}</Table.Cell>
                {payloadColumns.map((column: string) => {
                  const payload = datum.payload || {};
                  return <Table.Cell>{payload[column] || ''}</Table.Cell>;
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </>
  );
};
