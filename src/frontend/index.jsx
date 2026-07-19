import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  ProgressBar,
  List,
  ListItem,
  Badge,
  Heading,
  Spinner,
  Text,
  Box,
} from '@forge/react';
import { invoke, view } from '@forge/bridge';

const getDecisionAppearance = (percentage) =>
  percentage >= 80 ? 'success' : 'default';

const getBadgeAppearance = (percentage) =>
  percentage >= 80 ? 'added' : 'important';

const App = () => {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAnalysis = async () => {
      try {
        const ctx = await view.getContext();
        const issueKey = ctx?.extension?.issue?.key;

        if (!issueKey) {
          throw new Error('Issue key was not found.');
        }

        const result = await invoke('getText', { issueKey });

        if (isMounted) {
          setState({
            loading: false,
            data: result ?? null,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            loading: false,
            data: null,
            error,
          });
        }
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  const { loading, data, error } = state;

  if (loading) {
    return (
      <Box padding="space.200">
        <Spinner size="large" label="Fetching analysis..." />
        <Text>Please wait while we fetch the analysis...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding="space.200">
        <Text>Unable to load analysis data.</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box padding="space.200">
        <Text>No analysis data available.</Text>
      </Box>
    );
  }

  const decisionPercentage = Number(data.decision_percentage) || 0;
  const issuesFound = Array.isArray(data.issues_found) ? data.issues_found : [];
  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
    : [];

  return (
    <Box padding="space.200">
      <ProgressBar
        ariaLabel="Decision percentage"
        value={decisionPercentage / 100}
        appearance={getDecisionAppearance(decisionPercentage)}
      />

      <Badge appearance={getBadgeAppearance(decisionPercentage)}>
        {decisionPercentage}%
      </Badge>

      <Heading size="small">Issues Found:</Heading>
      <List type="ordered">
        {issuesFound.map((item, index) => (
          <ListItem key={`${item}-${index}`}>{item}</ListItem>
        ))}
      </List>

      <Heading size="small">Recommendations:</Heading>
      <List type="ordered">
        {recommendations.map((item, index) => (
          <ListItem key={`${item}-${index}`}>{item}</ListItem>
        ))}
      </List>
    </Box>
  );
};

ForgeReconciler.render(<App />);