## How to Use Anchor
1. Go to the Atlassian Marketplace and search for Anchor, or visit the [Marketplace listing](https://marketplace.atlassian.com/apps/3628381141/anchorr) directly.
2. Click Install and complete the setup for your Jira project.
3. Open Jira Boards and create a new board (or use an existing one) to try Anchor.
4. Create a new Jira issue and fill in the ticket details, such as the title, description, and any other relevant information.
5. Open the issue and click the Anchor button (highlighted in the screenshot) to analyze the ticket. <img width="1270" height="500" alt="Screenshot 2026-07-21 at 2 30 10 PM" src="https://github.com/user-attachments/assets/d24e15a5-e927-4973-9d07-62f21c6cfd6c" />
7. Review Anchor's recommendations, related historical tickets, and the Conflict Score to identify potential contradictions before moving forward.

## Archtiecture 
Anchor’s archtiecture is intentionally straightforward. The App is divided into two main modules/components 
  1. **Atlassian Plugin** :
     The component responsible for Anchor's interaction with Atlassian and Jira. It is developed using Atlassian Forge, JavaScript, and Forge UI,
     providing a seamless experience directly inside Jira.

  3. **Anchor Core Backend**
      The core backend is built using Supabase and Edge Functions, providing a simple, scalable, and serverless backend architecture.
      
      It contains:
      - **Anchor RAG Model** : Responsible for the classification and identification of Jira tickets and issues using semantic analysis.
      
      - **AI Conflict & Recommendation Model**:  Responsible for comparing the tickets after they have been filtered by the RAG model to identify
        conflicts and generate recommendations between them.

This keeps the backend lightweight while allowing AI analysis to run efficiently without managing dedicated infrastructure.
  
### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
