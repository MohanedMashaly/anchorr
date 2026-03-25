export { handler } from './resolvers';
import { errorCodes } from '@forge/sql';
import api,{ route,storage } from '@forge/api';
import crypto from 'crypto';
import { Ticket } from './model.js';
import axios from 'axios';

const getCloudId = (context) => {
    const contexts = context?.installation?.contexts;
    if (Array.isArray(contexts)) {
        for (const ctx of contexts) {
            if (ctx.cloudId) return ctx.cloudId;
        }
    }
    const installContext = context?.installContext || '';
    const match = installContext.match(/site\/([a-f0-9-]+)/i);
    if (match) return match[1];
    console.warn('Could not determine cloudId from Forge context');
    return 'unknown';
};
const fetchIssueDescription = async (issueKey) => {
    try {
        const response = await api.asApp().requestJira(
            route`/rest/api/2/issue/${issueKey}?fields=description`,
            { headers: { 'Accept': 'application/json' } }
        );
        console.log(`Fetched description for ${issueKey}:`, response);
        const data = await response.json();
        return data.fields?.description || '';
    } catch (error) {
        console.error(`Failed to fetch description for ${issueKey}:`, error);
        return '';
    }
};
export const callAnalysisAPI = async ({ summary, description, key }) => {
    try {
        // Log what we're about to send
        const payload = {
            summary: summary || "",
            description: description || "",
            jira_issue_key: key || ""
        };
        console.log('Keyyyyy:', key);
        const lamdaUrl = process.env.AWS_LAMBDA_ANALYSIS_URL+"";
        const response = await axios.post(
            lamdaUrl,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ANALYSIS_API_KEY}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveTicket = async (ticket) => {
    try {
        const payload = {
            client_id: ticket.client_id,
            jira_issue_key: ticket.jira_issue_key,
            title: ticket.title,
            description: ticket.description,
            is_subtask: ticket.is_subtask,
            priority: ticket.priority,
            label: ticket.label,
            event_name: 'insert.ticket'
        };
        const db_url =process.env.AWS_LAMBDA_DB_URL+"";
        console.log('Full payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(
            db_url,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                     'Authorization': `Bearer ${process.env.DB_API_KEY}`

                }
            }
        );
    } catch (error) {
        if (error.code === errorCodes.UNIQUE_VIOLATION) {
            console.warn('Ticket with this JIRA issue key already exists:', ticket.jira_issue_key);
        } else {
            throw error;
        }
    }
}

export const getDecision = async(ticket_key, client_id) => {
  try {
    const payload = { 
      client_id: client_id, 
      event_name: 'get.ticket.decision', 
      jira_issue_key: ticket_key 
    };
    const db_url =process.env.AWS_LAMBDA_DB_URL+"";
    const response = await axios.post(
      db_url,
      payload,
      { headers: { 'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${process.env.DB_API_KEY}`

      } }
    );
    

    // Check if response.data exists and has a body
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    // Parse the body if it's a Lambda response format
    if (response.data.body) {
      const data = JSON.parse(response.data.body);
      return data;
    }
    console.log('Raw response::', JSON.stringify( response.data, null, 2));
    // If it's already parsed
    return response.data;
    
  } catch (error) {
    console.error('Error fetching decision:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export async function run(event, context) {
    try {
        const issue = event?.issue;
        const eventType = event?.eventType;
        const clientId = getCloudId(context);
        if ((eventType === 'avi:jira:created:issue' || eventType === 'avi:jira:updated:issue') && issue) {
            const title = issue.fields?.name || '';
            const subtask = issue.fields?.subtask || '';
            const summary = issue.fields?.summary || '';
            const key = issue.key || 'UNKNOWN';
            const description = await fetchIssueDescription(key);
            console.log(`Processing issue ${key} with summary: ${summary} and description: ${description}`);
            const apiKey = process.env.OPENAI_API_KEY;
            const ticket = new Ticket({
                id: crypto.randomUUID(),
                client_id: clientId,
                jira_issue_key: key,
                title: summary,
                description: description,
                is_subtask: subtask,
                priority: '',
                label: '',
            });
            const response = await saveTicket(ticket);
            if (!apiKey) {
                console.error('OPENAI_API_KEY is not set in environment');
                return;
            }
            await storage.set('anchorr-status', {
                message: `Processing issue ${key}...`,
                timestamp: new Date().toISOString(),
                issueKey: key,
                processing: true
            });
            console.log(`Processing issue ${key} with summary: ${summary} and description: ${description}`);
            const analysisResponse = await callAnalysisAPI({
                summary,
                description,
                key
            });
            const analysis = analysisResponse.analysis;
            // Store the analysis
            await storage.set(`analysis-status`, {
                ...analysis,
                timestamp: new Date().toISOString(),
                issueKey: key,
                issueSummary: summary
            });
        }else if (eventType === 'avi:jira:viewed:issue') {
            try {
            const decision = await getDecision(issue.key);
            console.log('Decision fetched:',  {data: decision.decision[0]});
            await storage.delete('analysis-status');
            await storage.set(`analysis-status`, {
                ...decision.decision[0],
                timestamp: new Date().toISOString(),
                issueKey: issue.key,
                issueSummary: "Decision Retrieved"
            });
            }  catch (decisionErr) {
                console.error('Error fetching decision:', decisionErr);
            }
        }
    } catch (err) {
        try {
            await storage.set('anchorr-status', {
                message: `Error: ${err.message}`,
                timestamp: new Date().toISOString(),
                error: true
            });
        } catch (storageErr) {
        }
    }
}

export const onInstall = async (event) => {
    console.log('App installed with event:', event);
};