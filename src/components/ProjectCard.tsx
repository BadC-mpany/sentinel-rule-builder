"use client";

import React from "react";
import { Project } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Folder, Edit, Trash2, Calendar, Settings } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className={cn("hover:shadow-lg transition-all", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200")}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", isDark ? "bg-purple-900/30" : "bg-purple-100")}>
              <Folder className={cn("w-6 h-6", isDark ? "text-purple-400" : "text-purple-600")} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn("font-semibold text-lg mb-1 truncate", isDark ? "text-white" : "text-gray-900")}>
                {project.name}
              </h3>
              {project.description && (
                <p className={cn("text-sm mb-2 line-clamp-2", isDark ? "text-gray-400" : "text-gray-600")}>
                  {project.description}
                </p>
              )}
              <div className={cn("flex items-center gap-4 text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
                <span>{project.tools.length} tool{project.tools.length !== 1 ? "s" : ""}</span>
                <span>{project.policies.length} polic{project.policies.length !== 1 ? "ies" : "y"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(project.id)}
              className={cn(isDark ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" : "text-red-600 hover:text-red-700 hover:bg-red-50")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

