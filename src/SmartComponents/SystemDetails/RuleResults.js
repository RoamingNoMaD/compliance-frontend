import React, { useMemo } from 'react';
import RulesTable from '../../PresentationalComponents/RulesTable/RulesTableRest';
import propTypes from 'prop-types';
import TableStateProvider from '../../Frameworks/AsyncTableTools/components/TableStateProvider';
import useReportRuleResults from '../../Utilities/hooks/api/useReportRuleResults';
import { useSerialisedTableState } from '../../Frameworks/AsyncTableTools/hooks/useTableState';
import columns from './Columns';

const RuleResults = ({ reportTestResult }) => {
  const serialisedTableState = useSerialisedTableState();

  const { limit, offset } = serialisedTableState?.pagination || {};
  const filters = serialisedTableState?.filters;
  const sort = serialisedTableState?.sort;

  // Enable default filter
  const activeFiltersPassed = true;
  const activeFilters = {
    'rule-state': ['failed'],
  };

  const { data: ruleResults } = useReportRuleResults({
    params: [
      reportTestResult.id,
      reportTestResult.report_id,
      undefined,
      limit,
      offset,
      false,
      sort,
      filters,
    ],
    skip: serialisedTableState === undefined,
  });

  const rules = useMemo(
    () =>
      ruleResults !== undefined
        ? ruleResults.data.map((rule) => ({
            ...rule,
            profile: { name: reportTestResult.title },
          }))
        : [],
    [ruleResults, reportTestResult]
  );

  return (
    <RulesTable
      activeFiltersPassed={activeFiltersPassed}
      activeFilters={activeFilters}
      ansibleSupportFilter
      showFailedCounts
      rules={rules}
      columns={columns}
      policyId={reportTestResult.report_id}
      policyName={reportTestResult.title}
      total={ruleResults?.meta?.total}
      defaultTableView="rows"
      onSelect={true}
      remediationsEnabled
      reportTestResult={reportTestResult}
      skipValueDefinitions={true}
      // TODO: provide ruleTree
      // TODO: hide passed rules by default
    />
  );
};

RuleResults.propTypes = {
  hidePassed: propTypes.bool,
  reportTestResult: propTypes.object,
};

const RuleResultsWrapper = (props) => {
  return (
    <TableStateProvider>
      <RuleResults {...props} />
    </TableStateProvider>
  );
};
export default RuleResultsWrapper;
