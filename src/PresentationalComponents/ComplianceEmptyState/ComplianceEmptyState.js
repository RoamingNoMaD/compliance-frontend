import React from 'react';
import propTypes from 'prop-types';
import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  TextContent,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { CloudSecurityIcon } from '@patternfly/react-icons';
import { useQuery } from '@apollo/client';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';
import { ErrorCard } from 'PresentationalComponents';
const COMPLIANCE_API_ROOT = '/api/compliance';
import useAPIV2FeatureFlag from '@/Utilities/hooks/useAPIV2FeatureFlag';
import usePolicies from 'Utilities/hooks/api/usePolicies';

const QUERY = gql`
  {
    profiles(search: "external = false and canonical = false") {
      totalCount
    }
  }
`;

const ComplianceEmptyStateBase = ({
  title,
  mainButton,
  policiesCount,
  loading,
  error,
}) => {
  if (loading) {
    return <Spinner />;
  }

  if (error) {
    const errorMsg = `Oops! Error loading System data: ${error}`;
    return <ErrorCard errorMsg={errorMsg} />;
  }

  const policyWord = policiesCount > 1 ? 'policies' : 'policy';
  const haveWord = policiesCount > 1 ? 'have' : 'has';

  return (
    <EmptyState
      style={{
        '--pf-v5-c-empty-state__icon--FontSize':
          'var(--pf-v5-c-empty-state--m-xl__icon--FontSize)',
      }}
    >
      <EmptyStateHeader
        titleText={<>{title}</>}
        icon={
          <EmptyStateIcon
            style={{
              fontWeight: '500',
              color: 'var(--pf-v5-global--primary-color--100)',
            }}
            icon={CloudSecurityIcon}
          />
        }
        headingLevel="h2"
      />
      <EmptyStateBody>
        {policiesCount > 0 ? (
          <TextContent>
            <InsightsLink to="/scappolicies">
              {policiesCount} {policyWord}
            </InsightsLink>{' '}
            {haveWord} been created but {haveWord} no reports.
          </TextContent>
        ) : (
          <></>
        )}
        <TextContent>
          The Compliance service uses SCAP policies to track your
          organization&#39;s adherence to compliance requirements.
        </TextContent>
        <TextContent>
          Get started by adding a policy, or read documentation about how to
          connect OpenSCAP to the Compliance service.
        </TextContent>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>{mainButton}</EmptyStateActions>
        <EmptyStateActions>
          <Button
            variant="link"
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={
              `https://access.redhat.com/documentation/en-us/red_hat_insights/` +
              `1-latest/html/assessing_and_monitoring_security_policy_compliance_of_rhel_systems/index`
            }
          >
            Learn about OpenSCAP and Compliance
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

ComplianceEmptyStateBase.propTypes = {
  title: propTypes.string,
  mainButton: propTypes.object,
  policiesCount: propTypes.number,
  error: propTypes.object,
  loading: propTypes.bool,
};

ComplianceEmptyStateBase.defaultProps = {
  title: 'No policies',
  mainButton: (
    <Button
      variant="primary"
      component="a"
      href="/insights/compliance/scappolicies"
    >
      Create new policy
    </Button>
  ),
};

const EmptyStateGraphQL = ({ title, mainButton, client }) => {
  const { data, error, loading } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    client,
  });
  const policiesCount = data?.profiles?.totalCount || 0;

  return (
    <ComplianceEmptyStateBase
      title={title}
      mainButton={mainButton}
      policiesCount={policiesCount}
      loading={loading}
      error={error}
    />
  );
};

EmptyStateGraphQL.propTypes = {
  title: propTypes.string,
  mainButton: propTypes.object,
  client: propTypes.object,
};

EmptyStateGraphQL.defaultProps = {
  client: new ApolloClient({
    link: new HttpLink({
      uri: COMPLIANCE_API_ROOT + '/graphql',
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
  }),
};

const EmptyStateRest = ({ title, mainButton }) => {
  const { data, error, loading } = usePolicies({ params: { limit: 1 } });
  const policiesCount = data?.meta?.total || 0;

  return (
    <ComplianceEmptyStateBase
      title={title}
      mainButton={mainButton}
      policiesCount={policiesCount}
      loading={loading}
      error={error}
    />
  );
};

EmptyStateRest.propTypes = {
  title: propTypes.string,
  mainButton: propTypes.object,
};

const ComplianceEmptyStateWrapper = (props) => {
  const isRestApiEnabled = useAPIV2FeatureFlag();

  return isRestApiEnabled ? (
    <EmptyStateRest {...props} />
  ) : (
    <EmptyStateGraphQL {...props} />
  );
};

export default ComplianceEmptyStateWrapper;
