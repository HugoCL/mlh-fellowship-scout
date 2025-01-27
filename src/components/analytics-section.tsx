"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import { PRsByDate, PRsByRepoAndFellow } from "./analytics-charts";
import { CommitData, PRData, RepoStats } from "@/types/analytics";

export function AnalyticsSection({
  type,
  id,
}: {
  type: "batch" | "pod" | "fellow";
  id: string;
}) {
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false);
  const [prsByRepoData, setPrsByRepoData] = useState<RepoStats[]>([]);
  const [prsLast7DaysData, setPrsLast7DaysData] = useState<{
    repos: string[];
    prs?: { date?: string } & Record<string, number>[];
  }>({
    repos: [],
    prs: [],
  });
  const [commitsLast7DaysData, setCommitsLast7DaysData] = useState<
    CommitData[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const prsByRepoResponse = await fetch(
        `/api/analytics/prs-by-fellow?type=${type}&id=${id}`
      );
      const prsByRepoData: RepoStats[] = await prsByRepoResponse.json();
      setPrsByRepoData(prsByRepoData);

      let prsLast7Days: {
        repos: string[];
        prs?: { date?: string } & Record<string, number>[];
      };
      let commitsLast7Days: CommitData[];

      const prsResponse = await fetch(
        `/api/analytics/prs?type=${type}&id=${id}`
      );
      prsLast7Days = await prsResponse.json();

      const commitsResponse = await fetch(
        `/api/analytics/commits?type=${type}&id=${id}`
      );
      commitsLast7Days = await commitsResponse.json();

      setPrsLast7DaysData(prsLast7Days);
      setCommitsLast7DaysData(commitsLast7Days);
    };

    fetchData();
  }, []);

  return (
    <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between w-full">
              <span>Analytics</span>
              <CollapsibleTrigger asChild>
                <Button>
                  {analyticsOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardTitle>
        </CardHeader>
        <CollapsibleContent className="space-y-2">
          <CardContent>
            <div className="container mx-auto py-10">
              <PRsByRepoAndFellow data={prsByRepoData} />
              <PRsByDate data={prsLast7DaysData} type={type} id={id} />
              {/** 
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Pull Requests in Last 7 Days
                </h2>
                <Tabs defaultValue="batch">
                  <TabsList>
                    <TabsTrigger value="batch">By Batch</TabsTrigger>
                    <TabsTrigger value="pod">By Pod</TabsTrigger>
                    <TabsTrigger value="fellow">By Fellow</TabsTrigger>
                  </TabsList>
                  <TabsContent value="batch">
                    <PRsLast7Days data={prsLast7DaysData.batch} type="batch" />
                  </TabsContent>
                  <TabsContent value="pod">
                    <PRsLast7Days data={prsLast7DaysData.pod} type="pod" />
                  </TabsContent>
                  <TabsContent value="fellow">
                    <PRsLast7Days
                      data={prsLast7DaysData.fellow}
                      type="fellow"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Commits in Last 7 Days
                </h2>
                <Tabs defaultValue="batch">
                  <TabsList>
                    <TabsTrigger value="batch">By Batch</TabsTrigger>
                    <TabsTrigger value="pod">By Pod</TabsTrigger>
                    <TabsTrigger value="fellow">By Fellow</TabsTrigger>
                  </TabsList>
                  <TabsContent value="batch">
                    <CommitsLast7Days
                      data={commitsLast7DaysData.batch}
                      type="batch"
                    />
                  </TabsContent>
                  <TabsContent value="pod">
                    <CommitsLast7Days
                      data={commitsLast7DaysData.pod}
                      type="pod"
                    />
                  </TabsContent>
                  <TabsContent value="fellow">
                    <CommitsLast7Days
                      data={commitsLast7DaysData.fellow}
                      type="fellow"
                    />
                  </TabsContent>
                </Tabs>
              </div></CardContent>*/}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
