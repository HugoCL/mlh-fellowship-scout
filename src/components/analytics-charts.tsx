"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepoStats } from "@/types/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

// Pull requests by tracked repository and fellow
export function PRsByRepoAndFellow({ data }: { data: RepoStats[] }) {
  const chartConfig = {
    open: {
      label: "Open",
      color: "hsl(var(--chart-1))",
    },
    closed: {
      label: "Closed",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    data.length > 0 ? data[0].repo : undefined
  );
  const filteredProjectData = data.find(
    (project) => project.repo === selectedProject
  )?.fellows;

  const projectChartData = Object.keys(filteredProjectData || {}).map(
    (fellow) => ({
      fellow,
      ...(filteredProjectData?.[fellow] ?? {}),
    })
  );

  return (
    <>
      <Card className="w-full ">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Project PRs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] max-h-[500px] w-full p-4"
            >
              <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="repo" type="category" />
                <YAxis type="number" allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="open" stackId="a" fill="#4ade80" name="Open" />
                <Bar
                  dataKey="closed"
                  stackId="a"
                  fill="#3b82f6"
                  name="Closed"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center w-full h-48">
              <Alert>
                <AlertCircleIcon className="w-6 h-6 mr-2" />
                <AlertTitle>No PR data available</AlertTitle>
                <AlertDescription>
                  There is no PR data available, please add new PRs.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8" />
      <Card className="w-full ">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Project PRs by Fellow</CardTitle>
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select a value"
            >
              <SelectValue
                placeholder={data.length > 0 ? data[0].repo : "No data"}
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {data.map((project) => (
                <SelectItem key={project.repo} value={project.repo}>
                  {project.repo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredProjectData ? (
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] max-h-[500px] w-full p-4"
            >
              <BarChart accessibilityLayer data={projectChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="fellow" type="category" />
                <YAxis type="number" allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="open" stackId="a" fill="#4ade80" name="Open" />
                <Bar
                  dataKey="closed"
                  stackId="a"
                  fill="#3b82f6"
                  name="Closed"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center w-full h-48">
              <Alert>
                <AlertCircleIcon className="w-6 h-6 mr-2" />
                <AlertTitle>No PR data available</AlertTitle>
                <AlertDescription>
                  There is no PR data available for the selected project. Please
                  change the project or add new PRs.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Pull requests in the last 7 days (temporarily fixed)
export function PRsByDate({
  data,
  type,
  id,
}: {
  data: {
    repos: string[];
    prs?: { date?: string } & Record<string, number>[];
  };
  type: "batch" | "pod" | "fellow";
  id: string;
}) {
  const [selectedDateInterval, setSelectedDateInterval] = useState<
    string | undefined
  >("7d");

  const chartConfig = {
    prs: {
      label: "Number of PRs",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;
  return (
    <>
      <Separator className="my-8" />
      <Card className="w-full ">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>PRs Trends for {id}</CardTitle>
          </div>
          <Select
            value={selectedDateInterval}
            disabled={true}
            onValueChange={setSelectedDateInterval}
          >
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select a value"
            >
              <SelectValue placeholder={"7 days"} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {["7d", "14d", "30d"].map((interval) => (
                <SelectItem key={interval} value={interval}>
                  {interval === "7d"
                    ? "Last 7 days"
                    : interval === "14d"
                      ? "Last 14 days"
                      : "Last 30 days"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {data.repos ? (
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] max-h-[500px] w-full p-4"
            >
              <LineChart data={data.prs}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" type="category" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {data.repos.map((repo) => (
                  <Line
                    key={repo}
                    type="monotone"
                    dataKey={repo}
                    stroke="#3b82f6"
                    name={repo}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center w-full h-48">
              <Alert>
                <AlertCircleIcon className="w-6 h-6 mr-2" />
                <AlertTitle>No PR data available</AlertTitle>
                <AlertDescription>
                  There is no PR data available for the selected interval.
                  Please change the interval or add new PRs.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Commits in the last 7 days
export function CommitsLast7Days({
  data,
  type,
}: {
  data: any[];
  type: "batch" | "pod" | "fellow";
}) {
  return (
    <Card className="w-full h-[500px]">
      <CardHeader>
        <CardTitle>
          Commits in Last 7 Days by{" "}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="commits"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(${index * 45}, 70%, 60%)`}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
