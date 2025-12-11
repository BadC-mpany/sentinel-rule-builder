"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Folder,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { getUserProjects } from "@/lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";
import { Project } from "@/types";
import { ProjectManager } from "@/components/dashboard/ProjectManager";

export default function ApiSettingsPage() {
  const { theme } = useTheme();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    if (userLoaded && user?.id) {
      loadProjects();
    }
  }, [userLoaded, user?.id]);

  const loadProjects = async () => {
    if (!user?.id) return;
    setLoadingProjects(true);
    try {
      const token = await getToken();
      const userProjects = await getUserProjects(user.id, token || undefined);
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  return (
    <div className={cn("h-full overflow-y-auto p-6", isDark ? "bg-zinc-950" : "bg-white")}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={cn("text-3xl font-bold mb-2 font-[var(--font-inter)]", isDark ? "text-white" : "text-gray-900")}>
            API / JWT Settings
          </h1>
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
            Manage your API keys, track usage, and monitor security events.
          </p>
        </div>

        {/* Alert */}
        <Alert variant="warning" className="mb-8">
          <div>
            <h3 className="font-semibold mb-1">Keep your API keys secure</h3>
            <p className="text-sm opacity-90">
              Never share your API keys publicly or commit them to version control.
              Rotate keys regularly if you suspect a compromise.
            </p>
          </div>
        </Alert>

        {/* Projects List */}
        {loadingProjects ? (
          <div className={cn("rounded-xl border p-8 text-center", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className={cn("rounded-xl border p-8 text-center", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
            <Folder className={cn("w-12 h-12 mx-auto mb-3", isDark ? "text-gray-500" : "text-gray-400")} />
            <h3 className={cn("font-semibold mb-1", isDark ? "text-white" : "text-gray-900")}>No projects yet</h3>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              Create a project in the Rule Builder to access the dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {/* Project Cards */}
            {projects.map((project) => {
              const isExpanded = expandedProjectId === project.id;
              return (
                <div
                  key={project.id}
                  className={cn("rounded-xl border overflow-hidden transition-all", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}
                >
                  {/* Project Card Header - Clickable */}
                  <div
                    onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                    className={cn("w-full flex items-center justify-between p-6 hover:opacity-80 transition-opacity cursor-pointer", isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50")}
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", isDark ? "bg-purple-900/30" : "bg-purple-100")}>
                        <Key className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-600")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className={cn("font-semibold text-lg", isDark ? "text-white" : "text-gray-900")}>
                          {project.name}
                        </h2>
                        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                          {project.tools.length} tool{project.tools.length !== 1 ? "s" : ""} &bull; {project.policies.length} polic{project.policies.length !== 1 ? "ies" : "y"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")}>
                        <svg
                          className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-600")}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - Dashboard (Lazy Rendered) */}
                  {isExpanded && (
                    <div className={cn("border-t", isDark ? "border-zinc-800" : "border-gray-200")}>
                      <ProjectManager project={project} onUpdate={loadProjects} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
