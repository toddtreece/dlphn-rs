import React from 'react';
import { Table, Popup } from 'semantic-ui-react';
import { History } from 'history';
import moment from 'moment';

import { Data } from '../../client';

interface DataProps {
  streamKey: string;
  history: History;
  columns: string[];
  data: Data[];
}

export const DataTable: React.FC<DataProps> = props => {
  const { history, streamKey: key, columns, data } = props;

  return (
    <Table celled fixed>
      <Table.Header>
        <Table.Row>
          {columns.map((column: string) => (
            <Table.HeaderCell key={column}>{column}</Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.map((datum: Data) => (
          <Table.Row key={datum.id} onClick={() => history.push(`/streams/${key}/data`)}>
            <Table.Cell>
              <Popup
                size="mini"
                content={datum.created}
                trigger={<div>{moment(datum.created).fromNow()}</div>}
                inverted
              />
            </Table.Cell>
            {Object.values(datum.payload || {}).map((v, i) => {
              return <Table.Cell key={`data-cell-${datum.id}-${i}`}>{v}</Table.Cell>;
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
