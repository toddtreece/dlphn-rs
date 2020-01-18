import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumb } from 'semantic-ui-react';
import { match, Link } from 'react-router-dom';
import { History } from 'history';

import { ApplicationState } from '../store';
import { fetchRequest, startSubscription, endSubscription } from '../store/data/actions';
import { DataTable } from '../components/data/Table';
import { DataChart } from '../components/data/Chart';

interface RouteInfo {
  key: string;
}

interface MainProps {
  history: History;
  match: match<RouteInfo>;
}

export const DataPage: React.FC<MainProps> = props => {
  const { loading, columns, data, chart } = useSelector((state: ApplicationState) => state.data);
  const dispatch = useDispatch();
  const {
    history,
    match: {
      params: { key }
    }
  } = props;

  useEffect(() => {
    dispatch(fetchRequest(key));
    dispatch(startSubscription(key));
    return () => {
      dispatch(endSubscription(key));
    };
  }, [dispatch, key]);

  return (
    <>
      <Breadcrumb size="big">
        <Breadcrumb.Section as={Link} link to="/streams">
          Streams
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon="right chevron" />
        <Breadcrumb.Section>{key}</Breadcrumb.Section>
      </Breadcrumb>
      {!loading && data.length === 0 && <div>not found.</div>}
      {chart.length > 0 && <DataChart columns={columns} chart={chart}></DataChart>}
      {data.length > 0 && <DataTable streamKey={key} columns={columns} data={data} history={history}></DataTable>}
    </>
  );
};
