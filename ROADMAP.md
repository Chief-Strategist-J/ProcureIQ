# 🗺️ ProcureIQ Feature Implementation Roadmap

This document serves as the master feature roadmap for the `ProcureIQ` platform, incorporating core procurement domain models, operational workflows, and the multi-provider AI Voice Agent platform (`packages/voice`).

---

## 🟢 Completed Baseline & Core Architecture

* **Extreme-Scale Core Engine**:
  * Central dynamic Store & Redux-Saga Feature Registry (`@core/store/feature-registry`).
  * Cross-feature Pub/Sub Event Bus (`@core/event-bus/event-bus`).
  * Async Priority Rules Engine (`@core/rules-engine`).
  * Traced Workflow DAG Engine (`@core/workflow-engine`).
  * XState Machine Hook integration (`@core/state-machines`).
  * Visitor Pattern Field Renderers (`DataForm`, `DataTable`).
* **`auth`**: 4-Role Access Control Matrix (`Admin`, `Accountant`, `Engineer`, `User`) with dynamic role selection on login.
* **`identity`**: Identity Governance, Organization/Workspace RBAC scoping, Service Account management, and SHA-256 tamper-evident Audit Log Chain verification (`verifyAuditChain`).

---

## 🚀 Phase 1: Core Procurement Engine *(Highest Priority)*
> **Focus**: Establish the primary supply chain data lifecycle (Catalog → Requisitions → Purchase Orders → Invoices).

1. **`inventory` (Stock & Catalog Management)**
   * Product/Item Master catalog with SKU, categorization, and pricing.
   * Stock tracking (Available, Reserved, Reorder thresholds).
   * Prerequisite data source for Purchase Orders and Sales Invoicing.

2. **`purchase` (Purchase Requisitions & Orders)**
   * Purchase Requisition creation and automated approval workflows using `@core/workflow-engine`.
   * Supplier/Vendor management and PO dispatch.
   * Budget threshold evaluation using `@core/rules-engine`.

3. **`sales` (Sales Orders & Invoicing)**
   * Customer order processing and automated invoice generation.
   * Immediate stock reservation upon order booking.

---

## 🎙️ Phase 2: AI Voice Agent Platform (`packages/voice`) *(High Priority)*
> **Focus**: Multi-provider AI Voice Agents via VideoSDK & Langfuse tracing for hands-free warehouse operations and SIP telephony approvals.

4. **Procurement Voice Requisition & In-App Assistant**
   * **Realtime Pipelines**: Integration with `openai_realtime` (GPT-4o Realtime) & `google_realtime` (Gemini 2.0 Flash Live) for instant hands-free PO querying and voice requisitions.
   * **Custom & Cascade Pipelines**: Deepgram STT + Claude 3.5 / Gemini + ElevenLabs TTS for multi-lingual warehouse stock voice querying (`sarvam_cascade` for regional languages).

5. **SIP & Telephony Voice Agent (`sip` Pipeline)**
   * VideoSDK SIP integration for automated phone calls to suppliers and managers for urgent PO approval prompts over telephony.
   * **Langfuse Tracing**: Real-time STT/LLM/TTS cost, latency, and TTFT tracking.

---

## 📦 Phase 3: Operations & Fulfillment Automation *(High Priority)*
> **Focus**: Goods movement tracking and scheduled background workflows.

6. **`fieldservice` & `dispatch` (Dispatch Quantity & Logistics)**
   * Goods Receipt Notes (GRN) and dispatch quantity limits validation (`dispatch-quantity-flow.yml`).
   * Partial shipment tracking and delivery status updates.

7. **`jobs` (Job Scheduler & Reminders)**
   * Automated cron scheduler for reorder alerts and overdue approval escalations (`job-scheduler-flow.yml`, `reminder-flow.yml`).
   * Background saga triggers for recurring tasks.

---

## 🔔 Phase 4: Communication Subsystem & CRM *(Medium Priority)*
> **Focus**: Multi-channel notification bus and customer/supplier outreach.

8. **`notifications` & `email` (Notification Bus & Email Adapter)**
   * Event Bus subscribers listening to domain events (`po.created`, `stock.low`, `role.assigned`).
   * Spring Boot SMTP `NotificationSender` adapter implementation (`refactor/springboot-forgot-password-smtp-adapter`).

9. **`campaigns` (Supplier & Buyer Campaigns)**
   * Supplier sourcing campaigns and promotional buyer engagement workflows (`campaign-flow.yml`).

---

## 🔗 Phase 5: Extended Integrations & Web3 *(Lower Priority)*
> **Focus**: External platform integrations and crypto settlement.

10. **`github` (GitHub API Integration)**
    * Repository sync, commit trace linking, and webhook listeners (`github-api-flow.yml`).

11. **`crypto` / `wallet` (Wallet Settlement MFE)**
    * Web3 wallet connector and crypto settlement adapter for cross-border transactions.
