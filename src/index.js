export { handler } from './resolvers';
import { sql, errorCodes } from '@forge/sql';
import OpenAI from "openai";
import { storage } from '@forge/api';
import crypto from 'crypto';
import { title } from 'process';
import { Ticket } from './model.js';
import axios from 'axios';

export const callAnalysisAPI = async (summary, description) => {
    try {
        // Log what we're about to send
        console.log('=== CALLING LAMBDA ===');
        console.log('Summary:', summary.summary);
        console.log('Description:', description);
        console.log('Summary type:', typeof summary);
        console.log('Description type:', typeof description);
        console.log('Summary value:', JSON.stringify(summary));
        console.log('Description value:', JSON.stringify(description));
        
        const payload = {
            summary: summary.summary,
            description: description || ""
        };
        
        console.log('Full payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(
            'https://eyvut26eftut6kc2n5sk6fxzmy0pgpwp.lambda-url.us-east-2.on.aws',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('=== LAMBDA RESPONSE ===');
        console.log('Lambda response:', response.data);
        return response.data;
    } catch (error) {
        console.error('=== ERROR ===');
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
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
        console.log('Full payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(
            'https://tq1x4vc1i1.execute-api.us-east-2.amazonaws.com/default/db-ticket-lambda',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
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
export async function run(event, context) {
    try {
        const issue = event?.issue;
        if (issue) {
            console.log('Processing issue created event for issue key:', issue);
            const title = issue.fields?.name || '';
            const subtask = issue.fields?.subtask || '';
            const summary = issue.fields?.summary || '';
            const key = issue.key || 'UNKNOWN';
            let description = issue.fields?.issuetype?.description;
            console.log('Ticket Payload:', JSON.stringify(issue, null, 2));
            const apiKey = process.env.OPENAI_API_KEY;
            const ticket = new Ticket({
                id: crypto.randomUUID(),
                client_id: 2,
                jira_issue_key: key,
                title: summary,
                description: description,
                is_subtask: subtask,
                priority: '',
                label: '',
            });
            const response = await saveTicket(ticket);
            console.log('Ticket Response:', response);
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
            const analysisResponse = await callAnalysisAPI({
                summary,
                description
            });
            console.log('Analysis received:', analysisResponse);
            const analysis = analysisResponse.analysis;
            // Store the analysis
            await storage.set(`analysis-status`, {
                ...analysis,
                timestamp: new Date().toISOString(),
                issueKey: key,
                issueSummary: summary
            });
        }
    } catch (err) {
        console.error('Error handling issue created trigger:', err);
        console.error('Error stack:', err.stack);
        try {
            await storage.set('anchorr-status', {
                message: `Error: ${err.message}`,
                timestamp: new Date().toISOString(),
                error: true
            });
        } catch (storageErr) {
            console.error('Failed to store error status:', storageErr);
        }
    }
}

export const onInstall = async (event) => {
    console.log('App installed with event:', event);
};