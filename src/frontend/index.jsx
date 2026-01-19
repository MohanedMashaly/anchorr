import React, { useEffect, useState } from 'react';
import ForgeReconciler, { ProgressBar,List,ListItem,Badge,Heading } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    let mounted = true;

    invoke('getText').then((res) => {
      if (mounted) setData(res);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <ProgressBar ariaLabel="Decision percentage" value={(data?.decision_percentage/100) ?? 0} 
        appearance={data?.decision_percentage > 80 ? "success":"default"} />
       <Badge appearance={data?.decision_percentage >= 80 ? "added":"important"}>{data?.decision_percentage}</Badge>

      <Heading size="small">Issues Found:</Heading>
      <List type="ordered">
      {data?.issues_found.map((item) => (
      <ListItem>{item}</ListItem>
      ))}
      </List>

      <Heading size="small">Recommendations:</Heading>
      <List type="ordered">
      {data?.recommendations.map((item) => (
      <ListItem>{item}</ListItem>
      ))}
      </List>
    </>
  );
};
ForgeReconciler.render(<App />);