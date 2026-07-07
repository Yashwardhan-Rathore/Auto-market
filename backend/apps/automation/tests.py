from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.automation.models import (
    Automation,
    AutomationEdge,
    AutomationExecution,
    AutomationNode,
)
from apps.automation.nodes.utilities.wait import WaitNode
from apps.automation.services.executor import WorkflowExecutor
from apps.automation.services.retry import mark_retry_or_failed


class AutomationExecutionEngineTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="owner@example.com",
            password="password",
        )
        self.automation = Automation.objects.create(
            name="Lifecycle test",
            owner=self.user,
            status=Automation.Status.PUBLISHED,
        )

    def create_node(self, node_type, action_name, label, config=None):
        return AutomationNode.objects.create(
            automation=self.automation,
            node_type=node_type,
            action_name=action_name,
            label=label,
            business_config=config or {},
        )

    def test_wait_node_pauses_execution_with_resume_at(self):
        node = self.create_node(
            "UTILITY",
            "WAIT",
            "Wait five minutes",
            {
                "minutes": 5,
            },
        )
        execution = AutomationExecution.objects.create(
            automation=self.automation,
            triggered_by=self.user,
        )

        before = timezone.now()
        result = WaitNode().execute(
            execution,
            node,
            node.business_config,
        )
        execution.refresh_from_db()

        self.assertTrue(result["paused"])
        self.assertEqual(execution.status, "WAITING")
        self.assertEqual(execution.current_node, node)
        self.assertIsNotNone(execution.paused_at)
        self.assertGreaterEqual(
            execution.resume_at,
            before + timedelta(minutes=5),
        )

    def test_condition_result_follows_yes_or_no_edge(self):
        trigger = self.create_node(
            "TRIGGER",
            "MANUAL",
            "Manual",
        )
        condition = self.create_node(
            "CONDITION",
            "EQUALS",
            "Equals",
            {
                "left": "$.event.url",
                "right": "/pricing",
            },
        )
        yes_node = self.create_node(
            "ACTION",
            "END",
            "Yes end",
        )
        no_node = self.create_node(
            "ACTION",
            "END",
            "No end",
        )
        AutomationEdge.objects.create(
            automation=self.automation,
            source_node=trigger,
            target_node=condition,
        )
        AutomationEdge.objects.create(
            automation=self.automation,
            source_node=condition,
            target_node=yes_node,
            edge_type="YES",
        )
        AutomationEdge.objects.create(
            automation=self.automation,
            source_node=condition,
            target_node=no_node,
            edge_type="NO",
        )
        execution = AutomationExecution.objects.create(
            automation=self.automation,
            triggered_by=self.user,
            context={
                "event": {
                    "url": "/pricing",
                }
            },
        )

        executor = WorkflowExecutor(
            execution,
            start_node=condition,
        )
        result = executor.execute_node(condition)

        self.assertEqual(
            executor.get_next(condition, result),
            yes_node,
        )

    def test_retry_service_marks_retrying_until_max_attempts(self):
        node = self.create_node(
            "ACTION",
            "SEND_EMAIL",
            "Retryable email",
            {
                "retry_count": 1,
                "retry_delay": 30,
                "retry_strategy": "FIXED",
            },
        )
        execution = AutomationExecution.objects.create(
            automation=self.automation,
            triggered_by=self.user,
            current_node=node,
        )

        delay = mark_retry_or_failed(
            execution,
            RuntimeError("temporary"),
        )
        execution.refresh_from_db()

        self.assertEqual(delay, 30)
        self.assertEqual(execution.status, "RETRYING")
        self.assertEqual(execution.retry_count, 1)
        self.assertIsNotNone(execution.retry_after)

        mark_retry_or_failed(
            execution,
            RuntimeError("permanent"),
        )
        execution.refresh_from_db()

        self.assertEqual(execution.status, "FAILED")
        self.assertIn("permanent", execution.error_message)
