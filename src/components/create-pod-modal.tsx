"use client";

import { useState } from "react";
import { useTrackedRepos } from "../contexts/tracked-repos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreatePodModal({
  children,
  batchId,
}: {
  children: React.ReactNode;
  batchId: string;
}) {
  const [open, setOpen] = useState(false);
  const [podId, setPodId] = useState("");
  const [podName, setPodName] = useState("");
  const { addPod } = useTrackedRepos();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podId || !podName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    addPod(batchId, {
      id: podId,
      name: podName,
      users: [],
    });

    toast({
      title: "Success",
      description: `Pod ${podId} added successfully to Batch ${batchId}`,
    });

    setPodId("");
    setPodName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Pod</DialogTitle>
          <DialogDescription>
            Add a new pod to the selected batch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="podId" className="text-right">
                Pod ID
              </label>
              <Input
                id="podId"
                value={podId}
                onChange={(e) => setPodId(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="podName" className="text-right">
                Pod Name
              </label>
              <Input
                id="podName"
                value={podName}
                onChange={(e) => setPodName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Pod</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
