## How to Use Anchor
1. Go to the Atlassian Marketplace and search for **Anchor**, or visit the [Marketplace listing](https://marketplace.atlassian.com/apps/3628381141/anchorr) directly.
2. Click Install and complete the setup for your Jira project.
3. Open Jira Boards and create a new board (or use an existing one) to try **Anchor**.
4. Create a new Jira issue and fill in the ticket details, such as the title, description, and any other relevant information.
5. Open the issue and click the Anchor button (highlighted in the screenshot) to analyze the ticket. <img width="1270" height="500" alt="Screenshot 2026-07-21 at 2 30 10 PM" src="https://github.com/user-attachments/assets/d24e15a5-e927-4973-9d07-62f21c6cfd6c" />
7. Review Anchor's recommendations, related historical tickets, and the Conflict Score to identify potential contradictions before moving forward.

## Archtiecture 
Anchor’s archtiecture is intentionally straightforward. The App is divided into two main modules/components.
<img width="600" height="600" alt="image" src="https://github.com/user-attachments/assets/7c2e8207-0de3-4c33-9b6e-3380f8493e80" />


  1. **Anchor Plugin** :
     The component responsible for Anchor's interaction with Atlassian and Jira. It is developed using **Atlassian Forge**, **JavaScript**, and
     **Forge UI**, providing a seamless experience directly inside Jira.

This repo contains the code for this component(Atlassian Plugin).

  2. **Anchor Core Backend**
      The core backend is built using Supabase and Edge Functions, providing a simple, scalable, and serverless backend architecture.
      
      - **text embedding model** : Responsible for the classification and identification of Jira tickets and issues using semantic analysis and core          part of the RAG system in anchor.
      
      - **AI Conflict & Recommendation Model**:  Responsible for comparing the tickets after they have been filtered by the RAG model to identify
        conflicts and generate recommendations between them.

This keeps the backend lightweight while allowing AI analysis to run efficiently without managing dedicated infrastructure.

You will find Anchor core backend in this [repo](https://github.com/MohanedMashaly/acnhor-edge-function).
## How AI was used in Anchor : 

Anchor is an AI-driven solution, so AI is at the core of almost every part of the product.


For issue classification and semantic retrieval, we use **text-embedding-3-small**, an embedding model developed by OpenAI. Every Jira issue is embedded and indexed, allowing Anchor to retrieve only the most semantically relevant tickets instead of comparing against the entire project.

For recommendation generation and conflict detection, we use **gpt-5.6-luna**. After the **RAG system** retrieves the most relevant issues, the model compares them against the current ticket to identify requirement conflicts, duplicated work, and possible product drift.

We Also used  on **Codex** throughout development. One of the biggest improvements was using **Codex** to migrate our entire infrastructure from **AWS** to **Supabase** with zero downtime allowing us to transition seamlessly without disrupting development and it always feels good to go from couple of hundered dollars/month to zero dollar bills. Beyond infrastructure, Codex also accelerated implementation, helped optimize prompts and workflows, and reduced our AI costs significantly while maintaining the same level of accuracy.
 
## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
