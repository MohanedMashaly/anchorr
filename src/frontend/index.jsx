import React, { useEffect, useState } from 'react';
import ForgeReconciler, { ProgressBar, List, ListItem, Badge, Heading, Spinner, Text, Box } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    invoke('getText').then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box padding="space.200">
        <Spinner size="large" label="Fetching analysis..." />
        <Text>Please wait while we fetch the analysis...</Text>
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

  return (
    <>
      <ProgressBar
        ariaLabel="Decision percentage"
        value={(data?.decision_percentage / 100) ?? 0}
        appearance={data?.decision_percentage > 80 ? "success" : "default"}
      />
      <Badge appearance={data?.decision_percentage >= 80 ? "added" : "important"}>
        {data?.decision_percentage}
      </Badge>

      <Heading size="small">Issues Found:</Heading>
      <List type="ordered">
        {data?.issues_found.map((item, index) => (
          <ListItem key={index}>{item}</ListItem>
        ))}
      </List>

      <Heading size="small">Recommendations:</Heading>
      <List type="ordered">
        {data?.recommendations.map((item, index) => (
          <ListItem key={index}>{item}</ListItem>
        ))}
      </List>
    </>
  );
};

ForgeReconciler.render(<App />);