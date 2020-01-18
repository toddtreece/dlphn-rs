import React from 'react';
import { Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import moment from 'moment';

import { DataPayload } from '../../store/data/types';

interface DataProps {
  columns: string[];
  chart: DataPayload[];
}

export const DataChart: React.FC<DataProps> = props => {
  const { columns, chart } = props;
  const [created, ...lines] = columns;

  return (
    <ResponsiveContainer height={300} width="95%">
      <LineChart data={chart} style={{ marginTop: '2em' }}>
        <XAxis
          domain={['auto', 'auto']}
          name="Time"
          tickFormatter={time => moment(time).format('MM/DD HH:mm')}
          reversed={true}
          dataKey="created"
        />
        <YAxis />
        <Tooltip labelFormatter={time => moment(time).format('MM/DD/YY HH:mm:SS')} />
        {lines.map(name => (
          <Line type="monotone" stroke="#8884d8" key={`datatable-${name}`} dataKey={name} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
