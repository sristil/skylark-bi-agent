"use client";

import { FormEvent, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type DashboardAnalysis = {
  sector: string | null;

  deals: {
    totalDeals: number;
    openDeals: number;
    openPipelineValue: number;
    wonDeals: number;
    wonRevenue: number;
    lostDeals: number;
    lostValue: number;
    onHoldDeals: number;
    onHoldValue: number;
  };

  workOrders: {
    totalWorkOrders: number;
    completedWorkOrders: number;
    activeWorkOrders: number;
    totalWorkOrderValue: number;
    totalBilledValue: number;
    totalCollectedValue: number;
    totalAmountToBeBilled: number;
    totalAmountReceivable: number;
    billingCoveragePercent: number;
    collectionCoveragePercent: number;
  };

  dataQuality: {
    dealRecords: number;
    workOrderRecords: number;
  };
};

const sectors = [
  "All sectors",
  "Mining",
  "Renewables",
  "Railways",
  "Powerline",
  "Construction",
  "Others",
];

const quickQuestions = [
  "How is our pipeline looking?",
  "How are our work orders performing?",
  "How much money is currently receivable?",
  "Compare Mining sales with operations.",
];

function formatINR(value: number) {
  if (!Number.isFinite(value)) {
    return "₹0";
  }

  if (Math.abs(value) >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">
          {formatPercent(value)}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-900 transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Skylark's Business Intelligence Agent. Ask me about your sales pipeline, deals, work orders, billing, collections, receivables, or sector performance.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [analysis, setAnalysis] =
    useState<DashboardAnalysis | null>(null);

  const [dashboardLoading, setDashboardLoading] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState<string | null>(null);

  const [sector, setSector] =
    useState("All sectors");

  async function loadDashboard(
    selectedSector = sector
  ) {
    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const query =
        selectedSector === "All sectors"
          ? ""
          : `?sector=${encodeURIComponent(
              selectedSector
            )}`;

      const response = await fetch(
        `/api/dashboard${query}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load dashboard."
        );
      }

      setAnalysis(data.analysis);
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );
    } finally {
      setDashboardLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
    // Dashboard should load once initially.
    // Sector changes are handled by the select handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSectorChange(
    nextSector: string
  ) {
    setSector(nextSector);
    await loadDashboard(nextSector);
  }

  async function sendMessage(message?: string) {
    const text = (message ?? input).trim();

    if (!text || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Something went wrong."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);

      // Refresh dashboard after an AI interaction.
      void loadDashboard();
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `Sorry, I couldn't process that request.\n\n${error.message}`
              : "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    await sendMessage();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-lg font-bold text-white">
              S
            </div>

            <div>
              <h1 className="text-lg font-semibold">
                Skylark BI Agent
              </h1>

              <p className="text-xs text-gray-500">
                Business intelligence assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sector}
              onChange={(event) =>
                void handleSectorChange(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
            >
              {sectors.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <div className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live data
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-7">
        {/* Page heading */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500">
            Executive overview
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            Business performance
            {analysis?.sector
              ? ` — ${analysis.sector}`
              : ""}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Live sales and operations intelligence from
            Monday.com.
          </p>
        </div>

        {/* Loading */}
        {dashboardLoading && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            Loading live business data...
          </div>
        )}

        {/* Error */}
        {dashboardError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <strong>Dashboard error:</strong>{" "}
            {dashboardError}
          </div>
        )}

        {/* KPI cards */}
        {analysis && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Open Pipeline"
                value={formatINR(
                  analysis.deals.openPipelineValue
                )}
                subtitle={`${analysis.deals.openDeals} open deals`}
              />

              <MetricCard
                title="Won Revenue"
                value={formatINR(
                  analysis.deals.wonRevenue
                )}
                subtitle={`${analysis.deals.wonDeals} won deals`}
              />

              <MetricCard
                title="Work Order Value"
                value={formatINR(
                  analysis.workOrders.totalWorkOrderValue
                )}
                subtitle={`${analysis.workOrders.totalWorkOrders} total work orders`}
              />

              <MetricCard
                title="Amount Receivable"
                value={formatINR(
                  analysis.workOrders.totalAmountReceivable
                )}
                subtitle="Currently outstanding"
              />
            </div>

            {/* Secondary metrics */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Active Work Orders"
                value={String(
                  analysis.workOrders.activeWorkOrders
                )}
                subtitle="Not completed"
              />

              <MetricCard
                title="Completed Work Orders"
                value={String(
                  analysis.workOrders.completedWorkOrders
                )}
                subtitle="Execution completed"
              />

              <MetricCard
                title="Amount To Be Billed"
                value={formatINR(
                  analysis.workOrders.totalAmountToBeBilled
                )}
                subtitle="Remaining billing value"
              />

              <MetricCard
                title="On-Hold Deals"
                value={String(
                  analysis.deals.onHoldDeals
                )}
                subtitle={formatINR(
                  analysis.deals.onHoldValue
                )}
              />
            </div>

            {/* Analytics */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-semibold">
                    Sales pipeline
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Current sales position
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-sm text-gray-500">
                      Open pipeline
                    </span>

                    <span className="font-semibold">
                      {formatINR(
                        analysis.deals.openPipelineValue
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-sm text-gray-500">
                      Won revenue
                    </span>

                    <span className="font-semibold">
                      {formatINR(
                        analysis.deals.wonRevenue
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-sm text-gray-500">
                      Lost value
                    </span>

                    <span className="font-semibold">
                      {formatINR(
                        analysis.deals.lostValue
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      On-hold value
                    </span>

                    <span className="font-semibold">
                      {formatINR(
                        analysis.deals.onHoldValue
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-semibold">
                    Billing & collections
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Operational financial coverage
                  </p>
                </div>

                <div className="space-y-6">
                  <ProgressBar
                    label="Billing coverage"
                    value={
                      analysis.workOrders
                        .billingCoveragePercent
                    }
                  />

                  <ProgressBar
                    label="Collection coverage"
                    value={
                      analysis.workOrders
                        .collectionCoveragePercent
                    }
                  />

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">
                    <div>
                      <p className="text-xs text-gray-400">
                        Billed
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatINR(
                          analysis.workOrders
                            .totalBilledValue
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Collected
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatINR(
                          analysis.workOrders
                            .totalCollectedValue
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chat */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h3 className="text-xl font-semibold">
              Ask your business anything
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Ask questions and get executive-level
              answers from live business data.
            </p>
          </div>

          {/* Quick questions */}
          <div className="flex gap-2 overflow-x-auto border-b border-gray-100 p-4">
            {quickQuestions.map((question) => (
              <button
                key={question}
                onClick={() =>
                  void sendMessage(question)
                }
                disabled={loading}
                className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="max-h-[520px] min-h-[300px] space-y-5 overflow-y-auto p-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl rounded-2xl px-5 py-4 text-sm leading-7 ${
                    message.role === "user"
                      ? "bg-gray-950 text-white"
                      : "border border-gray-200 bg-gray-50 text-gray-800"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <article className="max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-3 text-xl font-bold">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mb-3 text-lg font-bold">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-2 text-base font-semibold">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-3 list-disc space-y-1 pl-5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-3 list-decimal space-y-1 pl-5">
                              {children}
                            </ol>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-950">
                              {children}
                            </strong>
                          ),
                          table: ({ children }) => (
                            <div className="mb-3 overflow-x-auto">
                              <table className="min-w-full border-collapse text-sm">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-gray-200 bg-gray-100 px-3 py-2 text-left font-semibold">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-gray-200 px-3 py-2">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </article>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-gray-500" />
                    Analyzing live business data...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-3"
            >
              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    if (!loading) {
                      void sendMessage();
                    }
                  }
                }}
                placeholder="Ask about pipeline, revenue, work orders, billing..."
                rows={2}
                disabled={loading}
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "..." : "Ask"}
              </button>
            </form>

            <p className="mt-2 text-xs text-gray-400">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-gray-400">
          Skylark BI Agent · Live Monday.com business
          intelligence
        </footer>
      </div>
    </main>
  );
}