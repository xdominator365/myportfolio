---
title: Why I built a trading platform where nobody loses money
date: 2026-11-21
tags: [mydhira, fastapi, product]
summary: MyDhira is a paper-trading platform — real market logic, fake money. The product reason it exists, and the one design decision everything else hangs off: trades are never edited, only appended.
---

Most people learn to invest the expensive way: they put real money in, make every beginner mistake at full price, and decide markets "aren't for them".

I wanted a place to make those mistakes for free. That's **MyDhira** — a paper-trading platform where you can place trades, track a portfolio and test strategies without risking a rupee.

## The product bet

Paper trading isn't new. What I think is missing is the *feedback*. A simulator that only tells you your balance is a game. A simulator that shows you *why* your portfolio moved — which decision helped, which one hurt, how you'd have done with a different rule — is a teacher.

So the analytics aren't an afterthought. They're the product. The trading screen is just how you generate the data.

## The one decision everything hangs off

Early on I made a rule: **a trade, once recorded, is never edited or deleted.** Every order, fill and cancellation is appended to a log, and everything else — positions, P&L, the portfolio chart — is derived from that log.

```python
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

@dataclass(frozen=True)
class Trade:
    user_id: str
    symbol: str
    side: str          # "BUY" or "SELL"
    quantity: int
    price: Decimal
    executed_at: datetime
```

`frozen=True` is a small thing that says a lot: the object can't change after it's created, and neither can the database row behind it.

Why bother?

- **Analytics need history, not just state.** "What was my portfolio worth last Tuesday?" is a simple replay of the log, not a forensic reconstruction.
- **Bugs become fixable.** If position maths was wrong, I fix the calculation and recompute. The source of truth was never corrupted.
- **It's how real trading systems think.** Brokers and exchanges keep immutable ledgers for exactly these reasons. Building it this way taught me more than any course.

## The stack, briefly

FastAPI for the REST APIs — typed request models catch bad orders before they reach the trading logic. PostgreSQL for the ledger, because relational constraints are a gift when money (even pretend money) is involved. React with TypeScript for the dashboards, where the type system earns its keep the moment you're juggling prices, quantities and percentages in the same component.

## What it's teaching me

Building MyDhira sits right where my two interests meet: engineering and investing. Every feature forces both questions at once — *how do I build this so it's correct?* and *would this actually make someone a better investor?*

It's a work in progress, and the Idea Lab in the Vision section shows roughly how far along it is. You can [try the live app](https://dhira-gamma.vercel.app/) — it's free, and you genuinely can't lose money.
