---
title: The race condition that only showed up at 2 a.m.
date: 2026-11-22
tags: [concurrency, aws, dynamodb]
summary: Nothing failed. No alerts, no stack traces — just claims that were quietly wrong. What lost updates look like in a serverless system, and the boring fix that removed them.
---

The worst bugs don't crash. They succeed — wrongly.

The service processed and prioritised claims: Python on AWS Lambda, DynamoDB underneath. It passed every test, and for weeks it looked healthy. Then, every so often, a claim would come back with a status that didn't match its history. No error in the logs. No failed invocation. Just data that was quietly wrong.

## Reading the logs the wrong way

My first instinct was to look for an exception. There wasn't one. The breakthrough came from lining up invocations *by claim id* instead of by time: whenever a claim went wrong, there were two or three invocations touching it within a few milliseconds of each other.

That's the shape of a **lost update**:

1. Instance A reads the claim — version 7.
2. Instance B reads the claim — also version 7.
3. A writes its change.
4. B writes its change, built on the version it read, and silently erases A's.

Both invocations "succeeded". Lambda did exactly what it was told. The bug was in what I'd told it.

## Why it only happened at night

Lambda scales out by running more copies of your function, and those copies share nothing. During the day, traffic was smooth enough that two updates to the *same* claim rarely overlapped. At night, batch jobs and retries arrived in bursts — and bursts are exactly when two copies read the same item at the same moment.

If your correctness depends on requests not overlapping, you don't have correctness. You have luck with a schedule.

## Reproduce first, fix second

Before changing anything, I wanted to make the bug happen on demand. A small Locust script fired concurrent updates at a handful of hot claim ids, and a checker compared the final state against the sum of the intended changes. Within a minute it was reporting lost updates. Now I had a test that failed — which is the only honest starting point for a fix.

## The fix is boring, which is the point

DynamoDB already knows how to say "no". Give every item a `version` attribute and make each write conditional on the version you read:

```python
from botocore.exceptions import ClientError

def save(table, claim, read_version):
    try:
        table.put_item(
            Item={**claim, "version": read_version + 1},
            ConditionExpression="version = :v",
            ExpressionAttributeValues={":v": read_version},
        )
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return False  # someone else won — re-read and retry
        raise
```

The caller re-reads, re-applies its change to the fresh item and tries again, with a small jittered backoff so the losers don't collide a second time. Exactly one writer wins each round; nobody's change disappears.

No distributed lock service, no queues, no new infrastructure. The database enforces the invariant, so it holds no matter how far the functions scale.

## What changed

The Locust checker went from a steady trickle of lost updates to zero. In production, failures linked to inconsistent state dropped by roughly 30%. The retry rate is now a metric we watch: when it climbs, we know contention is rising before it becomes a problem.

## What I took away

- **"No errors" is not the same as "correct".** Assert on the data, not just on the status codes.
- **Make the bug reproducible before you fix it.** A failing test turns a theory into a fact.
- **Put invariants where they can't be skipped.** Code in a Lambda can be bypassed by the next copy of that Lambda. A conditional write can't.

If you want to see it fail for yourself, scroll up to the Claim Getter diagram in Projects and press **Break it**.
