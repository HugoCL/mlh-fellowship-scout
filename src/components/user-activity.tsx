'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { GitPullRequest, GitCommit } from 'lucide-react'
import type { PullRequest, Commit } from '@/types/github'

export function UserActivity() {
  const [activity, setActivity] = useState<(PullRequest | Commit)[]>([])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {activity.map((item) => (
        <Card key={'number' in item ? item.number : item.sha}>
          <CardContent className="flex items-center p-4">
            {'number' in item ? (
              <GitPullRequest className="h-5 w-5 mr-2 text-purple-500" />
            ) : (
              <GitCommit className="h-5 w-5 mr-2 text-blue-500" />
            )}
            <div className="flex-1">
              <h3 className="font-medium">
                {'number' in item ? item.title : item.commit.message}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDate('number' in item ? item.created_at : item.commit.author.date)}
              </p>
            </div>
            <a
              href={'number' in item ? item.html_url : item.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View on GitHub
            </a>
          </CardContent>
        </Card>
      ))}
      {activity.length === 0 && (
        <p className="text-center text-muted-foreground">No activity to display</p>
      )}
    </div>
  )
}

