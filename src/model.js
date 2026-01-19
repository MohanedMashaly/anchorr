export class Ticket {
  constructor({
    id,
    client_id,
    jira_issue_key,
    title,
    description = null,
    is_subtask = false, 
    priority="",
    label="",
    createdAt = new Date(),
  }) {
    this.id = id;
    this.client_id = client_id;
    this.jira_issue_key = jira_issue_key;
    this.title = title;
    this.description = description;
    this.is_subtask = is_subtask;
    this.priority = priority;
    this.label = label;
    this.createdAt = createdAt;
  }
}
