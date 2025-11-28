/**
 * Code generation template for Find Issues action
 * Used when exporting workflows to standalone Next.js projects
 */
export const findIssuesCodegenTemplate = `import { LinearClient } from '@linear/sdk';

export async function findIssuesStep(input: {
  linearAssigneeId?: string;
  linearTeamId?: string;
  linearStatus?: string;
  linearLabel?: string;
}) {
  "use step";
  
  const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
  
  const filter: Record<string, unknown> = {};
  
  if (input.linearAssigneeId) {
    filter.assignee = { id: { eq: input.linearAssigneeId } };
  }
  
  if (input.linearTeamId) {
    filter.team = { id: { eq: input.linearTeamId } };
  }
  
  if (input.linearStatus && input.linearStatus !== 'any') {
    filter.state = { name: { eqIgnoreCase: input.linearStatus } };
  }
  
  if (input.linearLabel) {
    filter.labels = { name: { eqIgnoreCase: input.linearLabel } };
  }
  
  const issues = await linear.issues({ filter });
  
  return {
    issues: issues.nodes.map(issue => ({
      id: issue.id,
      title: issue.title,
      url: issue.url,
    })),
    count: issues.nodes.length,
  };
}`;

