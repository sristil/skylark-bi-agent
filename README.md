# Skylark BI Agent

An AI-powered Business Intelligence Agent for **Skylark Drones** that combines live business data from Monday.com with Google's Gemini AI to provide executive-level insights through a conversational interface.

## 🚀 Live Demo

**[Open Skylark BI Agent](https://skylark-bi-agent-six-beta.vercel.app/)**

> Live application deployed on Vercel.

---

## 📊 Overview

Skylark BI Agent allows business leaders to ask natural-language questions about sales, operations, billing, collections, receivables, and sector performance.

Instead of manually searching through business boards and spreadsheets, users can ask questions such as:

- How is our pipeline looking?
- How much money is currently receivable?
- How are our work orders performing?
- How is the Mining sector performing?
- Compare Mining sales with operations.
- Which sectors have the strongest pipeline?
- What are the major operational bottlenecks?

The agent retrieves the relevant live data from Monday.com, analyzes it, and generates concise executive-level insights using Gemini.

---

## ✨ Features

### 🤖 AI Business Intelligence
Ask business questions in natural language and receive concise, founder-level insights.

### 📈 Sales & Pipeline Analytics
Analyze:

- Open pipeline
- Won revenue
- Lost deals
- On-hold deals
- Deal stages
- Sector-level sales performance
- Deal values

### ⚙️ Work Order Analytics
Analyze:

- Total work orders
- Active projects
- Completed projects
- Work order value
- Billed value
- Collected value
- Amount to be billed
- Amount receivable
- Billing coverage
- Collection coverage
- Execution status

### 🔄 Cross-Board Intelligence

Combines sales and operations data to answer questions such as:

> "Compare Mining sales with operations."

This allows users to understand the relationship between pipeline, won business, project execution, billing, and collections.

### 🏭 Sector Filtering

Business metrics can be analyzed across sectors such as:

- Mining
- Renewables
- Railways
- Powerline
- Construction
- Others

### 🔴 Live Data

The application retrieves business data directly from Monday.com rather than relying on a static dataset.

### 🧹 Data Normalization & Quality

The backend normalizes raw Monday.com column data and handles:

- Missing values
- Invalid statuses
- Invalid stages
- Currency formatting
- Date parsing
- Sector normalization
- Data-quality reporting

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      User            │
                    │ Natural-language     │
                    │ business question    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Next.js UI      │
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Chat API Route    │
                    │    /api/chat        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Gemini AI        │
                    │ Function Calling    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
        ┌────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Pipeline  │ │ Work Orders  │ │ Cross Board  │
        │   Metrics  │ │   Metrics    │ │   Metrics    │
        └─────┬──────┘ └──────┬───────┘ └──────┬───────┘
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │     Monday.com      │
                    │   Live Business     │
                    │       Data          │
                    └─────────────────────┘
