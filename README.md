# Certified Agentic AI Engineer — 2026 Edition

[![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)](https://python.org)
[![Open In Colab](https://img.shields.io/badge/Open%20in-Colab-F9AB00?logo=googlecolab)](https://colab.research.google.com)

**One-Year Course Outline | 4 Modules × 3 Months | 312 Total Instruction Hours**

> Agentic AI has crossed from experimentation into execution. By 2026, Gartner predicts 40% of enterprise applications will embed AI agents, and IDC expects AI agents to be present in 80% of workplace tools. This curriculum is built to produce engineers who can design, build, and ship production-grade agentic systems — not just demos.

**Schedule:** 3 days/week × 2 hours/class = 6 hours/week × 52 weeks ≈ 312 total instruction hours

---

## Mandatory 2026 Technology Stack

| Category | Technologies |
|----------|-------------|
| Language | Markdown, Python, Prompt & Context Engineering |
| Agent Frameworks | OpenAI Agents SDK, Google ADK, LangChain v1, LangGraph *(one track selected before course launch)* |
| Agent Protocols | MCP (Model Context Protocol), A2A (Agent-to-Agent) |
| Autonomous Agents | OpenClaw, NanoClaw |
| Memory | mem0 or LangMem *(one selected before course launch)* |
| RAG & Vector DB | Qdrant or Pinecone *(one selected before course launch)* |
| Observability | LangSmith, Langfuse, Arize AI |
| Infrastructure | Docker, Microservices |
| Data Layer | SQLModel, Alembic, PostgreSQL / Neon DB (Serverless Postgres) |
| LLM Providers | OpenAI, Anthropic, Google, xAI (Grok), DeepSeek, Meta (LLaMA), Groq, Open-source via Ollama |
| Security | OAuth 2.1, NANDA identity protocol |
| No-Code Automation | n8n (visual workflow builder for agents) |
| AI Coding CLI | Claude Code (Anthropic's agentic coding CLI), Spectkit (Spec Driven Development) |

---

## Course Structure Overview

| Module | Title | Duration | Focus |
|--------|-------|----------|-------|
| 1 | Intro to AI, n8n, Python, Prompt/Context Engineering, Spec Driven Development, Claude Code | 3 Months | Foundations |
| 2 | Agent SDKs (OpenAI / Google ADK / LangChain+LangGraph), Short-Term Memory, RAG, Agentic Design Patterns, Multi-Agent Systems, Long-Term Memory | 3 Months | Intelligence Layer |
| 3 | FastAPI, Neon DB, SQLModel, Alembic, Protocols (HTTP/REST/JSON-RPC), Custom MCP Servers, A2A Protocol, Agent Evaluation & Testing, Observability, Fully Autonomous Agents, End-to-End Project | 3 Months | Collaboration Layer |
| 4 | Docker, Microservices, Dapr, DACA Pattern, Production Infrastructure, Ethics / Safety / Governance, Capstone Project | 3 Months | Production & Scale |

---

## Module 1 — Foundations
**Duration:** 3 Months (Weeks 1–12) | **~78 hours** | **Prerequisite:** Basic Python knowledge

**Goal:** Understand the AI landscape (predictive, generative, and agentic), build low-code AI agent systems with n8n, strengthen Python skills from basics to advanced for agentic development, master prompt and context engineering, learn AI-powered coding with Claude Code, and deliver a first coded agent project.

### Week 1–3 | Introduction to AI & n8n

**Week 1: Introduction to AI Paradigms**
- What is AI? History and evolution
- Predictive AI: classification, regression, and traditional ML
- Generative AI: text, image, code generation with LLMs
- Agentic AI: autonomous, tool-using, multi-step reasoning systems
- How LLMs work: tokenization basics, context windows, API calling patterns
- LLM provider overview: OpenAI, Anthropic, Google, xAI, DeepSeek, Meta, Groq, Ollama

**Week 2: n8n Fundamentals**
- What n8n is: an open-source, self-hostable visual workflow automation tool
- n8n vs. Zapier vs. Make — why n8n is the choice for agentic AI engineers
- Installing n8n locally and via Docker
- Core concepts: workflows, nodes, triggers, credentials
- The AI Agent node in n8n — connecting LLMs (OpenAI, Anthropic Claude) as workflow brains

**Week 3: Building AI Agent Workflows with n8n**
- Building a complete AI agent workflow: input → LLM reasoning → tool calls → output
- Sub-workflows as modular agent components
- Email triage agent: reads inbox, classifies, drafts replies, escalates
- Scheduled research agent: daily brief generation on a topic
- Webhook-triggered agents: responding to external events automatically

### Week 4–7 | Python for Agentic AI (Basics → Advanced)

**Week 4: Python Basics I**
- Data types, variables, and operators
- Control flow: if/else, loops, comprehensions
- Functions, scope, and closures
- Modules and imports

**Week 5: Python Basics II**
- Object-Oriented Programming: classes, inheritance, polymorphism
- File handling and I/O
- Error handling: try/except patterns
- Working with JSON and APIs

**Week 6: Advanced Python I**
- Decorators and context managers
- Generators and iterators
- Type hints and Pydantic v2 for data validation
- Python packaging with uv (the modern replacement for pip)

**Week 7: Advanced Python II**
- Asynchronous Python: asyncio, async/await
- Async patterns for agent development
- Virtual environments and pyproject.toml
- Git, GitHub, and collaborative workflows
- Development environment setup

### Week 8–9 | Prompt & Context Engineering + Spec Driven Development

**Week 8: Prompt Engineering**
- Markdown fundamentals: syntax, formatting, headers, lists, links, code blocks
- Zero-shot, one-shot, and few-shot prompting
- Chain-of-thought (CoT) and tree-of-thought prompting
- Role-playing, persona, and constraint-setting
- ReAct pattern (Reason + Act) for tool-using agents
- Prompt chaining and decomposition
- System prompt design for agentic behavior
- Guardrail prompts and safety constraints
- Structured output prompting with JSON schemas

**Week 9: Context Engineering + Spec Driven Development**
- What context engineering is: designing the full information environment an LLM operates in
- Context window management strategies
- Dynamic context injection and retrieval
- Context compression and summarization techniques
- Spec Driven Development: writing specifications before code
- Using Spectkit for AI-assisted spec-driven workflows
- Manual prompt evaluation frameworks
- A/B testing prompts systematically
- Introduction to LangSmith for tracing and evaluation

### Week 10–11 | Claude Code

**Week 10: Claude Code Fundamentals**
- What Claude Code is: Anthropic's agentic CLI that reads, writes, and runs code autonomously
- Installing and authenticating Claude Code
- Core workflows: explaining codebases, writing features, fixing bugs, running tests via natural language
- Using Claude Code for agentic project scaffolding and refactoring
- From Spectkit specs to implementation with Claude Code

**Week 11: Claude Code Advanced — Skills, Sub-agents & Plugins**
- Claude Skills: what they are, how to create and use them
- Claude Sub-agents: delegating tasks to specialized sub-agents
- Claude Plugins: extending Claude Code with third-party integrations
- Best practices: when to trust Claude Code vs. review manually
- Integrating Claude Code into daily development workflow alongside Git

### Week 12 | First Agent Build & Module 1 Project

**First Coded Agent**
- Introduction to building agents with code using the chosen SDK
- Building a simple agent with tool integration
- Agent instructions, personas, and tool configuration

**Module 1 Project:** Build a working AI agent system — both a low-code n8n workflow and a coded agent — demonstrating prompt engineering skills from Weeks 8–9.

**Module 1 Assessment**
- Quiz 1: AI Fundamentals & Python (MCQ, 1 hour)
- Quiz 2: Prompt Engineering & Context Engineering (48 MCQs, 2 hours)
- Module Project: Working AI agent system — n8n workflow + coded agent, deployed with Docker

---

## Module 2 — Intelligence Layer
**Duration:** 3 Months (Weeks 13–24) | **~78 hours** | **Prerequisite:** Module 1 completion

**Goal:** Master a production agent framework in depth with integrated short-term memory, ground agents in private knowledge using RAG, learn framework-agnostic agentic design patterns, build multi-agent systems, and implement long-term persistent memory.

**Framework Track:** One of the following will be selected before course launch:
- **Option A:** OpenAI Agents SDK
- **Option B:** Google ADK (Agent Development Kit)
- **Option C:** LangChain v1 + LangGraph

### Week 13–17 | Agent Framework Deep Dive + Short-Term Memory

**Option A: OpenAI Agents SDK**
- Week 13: SDK architecture, four primitives (Agents, Tools, Handoffs, Runner), `@function_tool` decorator
- Week 14: Agent cloning, dynamic instructions, structured tool I/O with Pydantic, built-in tools
- Week 15: Multi-agent orchestration: handoffs, supervisor/worker patterns, context objects
- Week 16: Short-term memory: conversation history, context window management, Redis for session memory
- Week 17: Session management, state persistence. Project: stateful multi-turn agent with tools and memory

**Option B: Google ADK**
- Week 13: ADK architecture, LlmAgent, tools, orchestration, model flexibility via LiteLLM
- Week 14: Native MCP tool integration, custom tools, Agent Garden, bidirectional streaming
- Week 15: Multi-agent orchestration: hierarchical structures, agent-to-agent delegation
- Week 16: ADK session management, context window management, Redis for session memory
- Week 17: Concurrent sessions, state persistence. Project: stateful multi-turn agent

**Option C: LangChain v1 + LangGraph**
- Week 13: LangChain v1 — `create_agent`, model integrations, building tools, structured outputs
- Week 14: Middleware system: SummarizationMiddleware, HumanInTheLoopMiddleware, custom decorators
- Week 15: LangGraph graph-based workflows: nodes, edges, state, checkpointing, Deep Agents
- Week 16: Short-term memory, SummarizationMiddleware, LangGraph checkpointing, Redis
- Week 17: Session management, state persistence. Project: stateful multi-turn agent

### Week 18–20 | RAG — Retrieval Augmented Generation

**Week 18: RAG Foundations**
- What RAG is and why it outperforms fine-tuning for knowledge tasks
- Document loading: PDFs, web pages, databases, APIs
- Chunking strategies: fixed-size, recursive, semantic, document-aware
- Embedding models and vector databases (Qdrant or Pinecone)
- Indexing and storing embeddings

**Week 19: Retrieval Strategies & RAG Types**
- Similarity search, hybrid search, re-ranking
- Naive RAG, Advanced RAG, Modular RAG
- Agentic RAG, Multi-hop RAG, Graph RAG, Self-RAG

**Week 20: Production RAG**
- RAG evaluation: faithfulness, relevance, context recall, answer correctness
- Caching and optimization for production RAG
- Integrating RAG as a tool inside agents
- Project: RAG-powered agent over a document corpus

### Week 21–23 | Agentic Design Patterns + Multi-Agent Systems

**Week 21: Core Design Patterns (Framework-Agnostic)**
- ReAct, Plan-and-Execute, Reflection
- Tool-use patterns: parallel tool calls, sequential tool chains
- Human-in-the-loop: escalation and approval workflows

**Week 22: Orchestration Patterns**
- Supervisor, Hierarchical, Swarm, Pipeline, Router patterns
- When to use which pattern — decision framework
- Anti-patterns: common mistakes in agentic system design

**Week 23: Multi-Agent Systems Implementation**
- Implementing design patterns using the chosen framework
- Agent handoffs, routing, shared memory, error handling
- Combining patterns for complex workflows

**Practical Project:** Build a 3-agent pipeline (planner, researcher, writer) with RAG and short-term memory.

### Week 24 | Long-Term Memory

**Memory Framework:** mem0 or LangMem (one selected before course launch)

- Memory categories: episodic, semantic, procedural
- Persistent storage with vector DBs and knowledge graphs
- Memory consolidation and forgetting strategies
- User-specific personalization memory
- PostgreSQL + pgvector for long-term semantic memory

**Module 2 Assessment**
- Quiz 3: Agent SDKs, RAG, Memory & Design Patterns (MCQ + code, 2 hours)
- Mid-Term Project: Knowledge-grounded agent — RAG + short-term memory + long-term memory + multi-agent orchestration

---

## Module 3 — Collaboration Layer
**Duration:** 3 Months (Weeks 25–36) | **~78 hours** | **Prerequisite:** Module 2 completion

**Goal:** Build production backends with FastAPI and Neon DB, understand protocol foundations, create custom MCP servers and A2A implementations, evaluate and observe agent systems, build fully autonomous agents, and deliver a complete end-to-end project.

### Week 25–28 | FastAPI & Database Layer

**Week 25: FastAPI Fundamentals**
- Path operations, request/response models with Pydantic
- Dependency injection, middleware, async endpoints
- OpenAPI/Swagger auto-generated documentation

**Week 26: Database Layer**
- Neon DB: serverless PostgreSQL — setup and configuration
- SQLModel: Python ORM combining SQLAlchemy and Pydantic
- Alembic: database migrations
- Connecting FastAPI to Neon DB with async SQLAlchemy

**Week 27: Advanced FastAPI for Agents**
- Streaming responses for LLM output (Server-Sent Events)
- Handling long-running agent tasks, basic JWT authentication
- Background workers and task queues

**Week 28: Building Agent APIs**
- RESTful APIs serving AI agents, WebSocket connections
- Error handling and retry patterns
- Project: FastAPI backend with Neon DB serving agent queries via streaming

### Week 29 | Protocol Foundations

- HTTP fundamentals: request/response, methods, headers, status codes
- REST API basics, JSON-RPC, Server-Sent Events
- Why these protocols matter for MCP and A2A

### Week 30–31 | Custom MCP Servers & A2A Protocol

**Week 30: Building Custom MCP Servers**
- FastMCP library for rapid MCP server development
- Exposing tools, resources, and prompt templates via MCP
- MCP Security: OAuth 2.1 authentication
- Tool discovery, dynamic capability loading
- Databases and RAG pipelines as MCP resources

**Week 31: A2A Protocol**
- What A2A is: standardized peer-to-peer agent communication
- Agent Cards: advertising agent capabilities
- A2A message structure and task lifecycle
- The pattern: MCP for vertical tool integration, A2A for horizontal agent collaboration
- NANDA: identity, authorization, and audit layer for agents
- Project: agents communicating via custom MCP + A2A

### Week 32 | Agent Evaluation, Testing, Tracing & Observability

**Evaluation & Testing**
- Manual evaluation frameworks, automated evaluation with LangSmith
- RAG evaluation: RAGAS (faithfulness, relevance, context recall)
- Human-in-the-loop evaluation, regression testing, cost tracking

**LLM Economics**
- Token pricing, model routing, budget management
- Prompt caching, semantic caching
- Small Language Models (SLMs) for routine tasks
- Cost monitoring with LangSmith and Langfuse

**Tracing & Observability**
- OpenTelemetry, LangSmith, Langfuse
- Logging agent decisions and tool calls
- Circuit breakers and retry policies

### Week 33–35 | Fully Autonomous Agents

**Week 33: Autonomous Agent Fundamentals**
- Assisted vs. semi-autonomous vs. fully autonomous — the autonomy spectrum
- Architecture of autonomous agents: perception, planning, action, memory loops
- Safety guardrails: bounded autonomy, escalation paths, human-in-the-loop checkpoints

**Week 34: OpenClaw**
- Architecture, browser automation, task planning and self-correction
- Integration with MCP and A2A protocols

**Week 35: NanoClaw**
- Lightweight autonomous agents for focused tasks
- Error recovery, graceful degradation, reversible actions

### Week 36 | End-to-End Project

Build a fully autonomous agent system that independently researches a topic, gathers data via custom MCP servers, collaborates via A2A, stores results in Neon DB, and produces a structured report — with safety guardrails, observability, and human escalation.

**Module 3 Assessment**
- Quiz 4: FastAPI, MCP, A2A, Evaluation & Autonomous Agents (MCQ + code, 2 hours)
- Hackathon 1 (8 hours): Multi-agent system using custom MCP + A2A. Teams of 2–3.
- End-to-End Project: Autonomous agent system with full backend, protocols, and observability

---

## Module 4 — Production & Scale
**Duration:** 3 Months (Weeks 37–48) | **~78 hours** | **Prerequisite:** Module 3 completion

**Goal:** Move from working prototypes to production-grade, enterprise-ready systems. Master containerization with Docker, microservice architecture, the DACA pattern for scalable deployment, understand ethical responsibilities, and complete a capstone project.

### Week 37–39 | Docker & Microservices for Agents

**Week 37: Docker Fundamentals**
- Writing production Dockerfiles for FastAPI + agent apps
- Docker images, containers, registries
- Managing secrets securely, multi-stage builds

**Week 38: Docker Compose & Multi-Service Development**
- Networking between containers, volume management
- Running agent backends, databases, and MCP servers together

**Week 39: Microservice Architecture for Agents**
- Decomposing agentic systems into microservices
- API gateway patterns, structuring MCP servers as independent microservices
- Health checks and monitoring for containerized agents

### Week 40–42 | Dapr & the DACA Pattern

**Week 40: Dapr Building Blocks**
- Service Invocation, State Management (Redis/CockroachDB)
- Pub/Sub Messaging with Kafka/RabbitMQ

**Week 41: Advanced Dapr**
- Workflows: durable, resumable multi-step agent processes
- Virtual Actors (Dapr Agents): stateful agents at massive scale
- Dapr sidecars and Docker Compose integration

**Week 42: The DACA Design Pattern**
- AI-first + cloud-first design principles
- Stateless containerized agents with Dapr sidecars
- Scaling from local development to planetary scale
- The "10 million concurrent agents" architecture challenge

**Production Infrastructure**
- CockroachDB for globally distributed agent state
- RabbitMQ / Apache Kafka for high-throughput message queues
- Azure Container Apps (ACA) for serverless deployment
- ArgoCD for GitOps-based continuous deployment

### Week 43–44 | Ethical AI, Safety & Governance

**Week 43: AI Agent Ethics**
- The governance imperative: why most agentic pilots fail (Deloitte 2025 data)
- Bounded autonomy, bias mitigation, privacy and data protection

**Week 44: Safety Architecture & Compliance**
- Input/output guardrails: prompt injection defense, harmful content filtering
- Audit trails, circuit breakers, reversible actions
- EU AI Act, NIST AI Risk Management Framework, SOC 2 compliance

### Week 45–48 | Capstone Project

- **Week 45:** Project proposal — define problem, choose tech stack, present architecture diagram
- **Weeks 46–47:** Iterative development — full agentic system with FastAPI, multi-agent pipeline, MCP, memory, Dapr
- **Week 48:** Testing, documentation, and final 20-minute presentation

**Suggested Capstone Ideas**
- AI-powered research assistant: multi-agent pipeline with RAG, deployed with Docker
- Autonomous workflow engine: agents that process business forms, route tasks via A2A
- Personalized learning agent: adapts content using mem0/LangMem
- Agentic DevOps assistant: monitors infrastructure, diagnoses issues, proposes fixes

**Module 4 Assessment**
- Quiz 5: Docker + Dapr + DACA Pattern (simulation-based, 2 hours)
- Hackathon 2 (8 hours): Agent-native startup challenge — build an MVP of an agentic product
- Capstone Project (40% of final grade): Full system design, implementation, deployment, and presentation

---

## Full Course Assessment Framework

| Component | Weight | Description |
|-----------|--------|-------------|
| Module Quizzes (5 total) | 20% | MCQ + code analysis after each major topic |
| Hackathon 1 (MCP + A2A) | 10% | 8-hour team build challenge |
| Hackathon 2 (Agent Startup) | 10% | 8-hour agent product MVP |
| Mid-Term Project (Module 2) | 20% | RAG + memory + multi-agent research assistant |
| Capstone Project (Module 4) | 35% | Full system: design, code, deployment, presentation |
| Participation & Peer Review | 5% | Active engagement, code reviews, peer feedback |

### Grading Scale

| Grade | Score Range |
|-------|------------|
| A — Excellent | 90–100% |
| B — Good | 80–89% |
| C — Satisfactory | 70–79% |
| D — Passing | 60–69% |
| F — Failing | Below 60% |

---

## International Certification Pathway

Upon course completion, students are prepared for:
1. **IBM RAG and Agentic AI Professional Certificate** — validates RAG, MCP, LangGraph skills
2. **NVIDIA Generative AI with LLMs Certification** — validates LLM fundamentals and generative AI practice
3. **AWS / Azure AI Engineer Certifications** — cloud deployment and managed AI services

---

*Curriculum Version: March 2026 | Based on Panaversity learn-agentic-ai Repository & Advanced Python with AI Course.*
