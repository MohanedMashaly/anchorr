import { migrationRunner } from '@forge/sql';

export const CREATE_USERS_TABLE = `CREATE TABLE Client (
    id  SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP
)`;


export const CREATE_TICKET_TABLE = `CREATE TABLE IF NOT EXISTS Ticket (
    id  SERIAL  PRIMARY KEY,
    client_id INT NOT NULL,
    jira_issue_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_subtask BOOLEAN,
    priority TEXT,
    labels TEXT,
    created_at timestamp
)`;

export const CREATE_DECISION_TABLE = `CREATE TABLE IF NOT EXISTS Decision (
    id INT PRIMARY KEY UUID,
    client_id INT NOT NULL,
    ticket_id INT NOT NULL,
    issues_found TEXT UNIQUE NOT NULL,
    recommendations TEXT UNIQUE NOT NULL,
    decision_percentage INT,
    status TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const migrations = migrationRunner
  .enqueue('v001_create_users_table', CREATE_USERS_TABLE)
  .enqueue('v002_create_tickets_table', CREATE_TICKET_TABLE)
  .enqueue('v003_create_decisions_table', CREATE_DECISION_TABLE)

export const runSchemaMigration = async () => {
  try {
    console.log('Running schema migrations');
    const successfulMigrations = await migrations.run();
    console.log('Migrations applied:', successfulMigrations);

    const migrationHistory = (await migrationRunner.list())
      .map((y) => `${y.id}, ${y.name}, ${y.migratedAt.toUTCString()}`)
      .join('\n');
    console.log('Migrations history:\nid, name, migrated_at\n', migrationHistory);

    return getHttpResponse(200, 'Migrations successfully executed');
  } catch (e) {
    console.error('Error while executing migration', { error: JSON.stringify(e)});
    return getHttpResponse(500, 'Error while executing migrations');
  }
};

function getHttpResponse<Body>(statusCode: number, body: Body) {
  let statusText = '';
  if (statusCode === 200) {
    statusText = 'Ok';
  } else if (statusCode === 404) {
    statusText = 'Not Found';
  } else {
    statusText = 'Bad Request';
  }

  return {
    headers: { 'Content-Type': ['application/json'] },
    statusCode,
    statusText,
    body,
  };
}