import type { Metadata } from 'next';
import { WorkflowBuilderView } from '@/features/workflow-builder';

export const metadata: Metadata = {
  title: 'Automation Workflow Builder',
};

export default function WorkflowsPage() {
  return <WorkflowBuilderView />;
}
