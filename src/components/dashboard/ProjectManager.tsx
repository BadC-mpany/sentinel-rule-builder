"use client";

import React, { useEffect, useState } from "react";
import {
    Activity,
    Users,
    ShieldAlert,
    Coins,
    RefreshCw,
    Key,
    Eye,
    EyeOff,
    Copy,
    Check,
    Search,
    Filter
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TrafficChart } from "./TrafficChart";
import { StatCard } from "./StatCard";
import { SecurityEventsTable } from "./SecurityEventsTable";
import {
    getProjectStats,
    getProjectTraffic,
    getSecurityEvents,
    rollApiKey,
    rollJwtSecrets,
    getTokenUsageHistory,
    ProjectStats,
    TrafficDataPoint
} from "@/lib/supabase";
import { TokenUsageChart } from "./TokenUsageChart";
import { Project } from "@/types";
import { RollKeyWarningModal } from "./RollKeyWarningModal";

interface ProjectManagerProps {
    project: Project;
    onUpdate: () => void;
}

export function ProjectManager({ project, onUpdate }: ProjectManagerProps) {
    const { theme } = useTheme();
    const { getToken } = useAuth();
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
    const [tokenData, setTokenData] = useState<{ time: string; tokens: number }[]>([]);
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState<number>(0);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [rollingApiKey, setRollingApiKey] = useState(false);
    const [rollingJwt, setRollingJwt] = useState(false);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [warningModal, setWarningModal] = useState<{ type: "api" | "jwt"; isOpen: boolean }>({ type: "api", isOpen: false });

    const isDark = theme === "dark";

    useEffect(() => {
        loadDashboardData();
    }, [project.id]);

    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                loadDashboardData(true);
            }, refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, project.id]);

    const loadDashboardData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const token = await getToken();
            const [statsData, traffic, events, tokensInfo] = await Promise.all([
                getProjectStats(project.id, token || undefined),
                getProjectTraffic(project.id, 7, token || undefined),
                getSecurityEvents(project.id, 5, token || undefined),
                getTokenUsageHistory(project.id, 7, token || undefined)
            ]);

            setStats(statsData);
            setTrafficData(traffic);
            setSecurityEvents(events);
            setTokenData(tokensInfo);
            setLastRefreshed(new Date());
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            if (!isRefresh) setLoading(false);
        }
    };

    const handleRollApiKey = async () => {
        setRollingApiKey(true);
        try {
            const token = await getToken();
            await rollApiKey(project.id, token || undefined);
            onUpdate(); // Refresh parent state
            setWarningModal({ type: "api", isOpen: false });
        } catch (error) {
            console.error("Error rolling API key:", error);
            alert("Failed to roll API key. Please try again.");
        } finally {
            setRollingApiKey(false);
        }
    };

    const handleRollJwtSecrets = async () => {
        setRollingJwt(true);
        try {
            const token = await getToken();
            await rollJwtSecrets(project.id, token || undefined);
            onUpdate(); // Refresh parent state
            setWarningModal({ type: "jwt", isOpen: false });
        } catch (error) {
            console.error("Error rolling JWT secrets:", error);
            alert("Failed to roll JWT secrets. Please try again.");
        } finally {
            setRollingJwt(false);
        }
    };

    const copyKey = async (key: string, id: string) => {
        await navigator.clipboard.writeText(key);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const maskKey = (key: string) => {
        if (!key) return "••••••••••••••••";
        if (key.length <= 10) return "•".repeat(key.length);
        return key.substring(0, 4) + "•".repeat(32) + key.substring(key.length - 4);
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <RefreshCw className={cn("w-8 h-8 mx-auto mb-4 animate-spin", isDark ? "text-gray-600" : "text-gray-400")} />
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className={cn("p-6 space-y-8", isDark ? "bg-zinc-950" : "bg-gray-50")}>
            {/* Header / Toolbar */}
            <div className="flex justify-end items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                        Auto-refresh:
                    </span>
                    <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        className={cn("text-xs border rounded-md px-2 py-1 outline-none focus:ring-1", isDark ? "bg-gray-800 border-gray-700 text-white focus:ring-purple-500" : "bg-white border-gray-200 focus:ring-purple-500")}
                    >
                        <option value={0}>Off</option>
                        <option value={5}>5s</option>
                        <option value={10}>10s</option>
                        <option value={60}>60s</option>
                    </select>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadDashboardData(true)} className="h-8 gap-2">
                    <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>



            {/* API Credentials (Full Width) */}
            <div className={cn("p-6 rounded-xl border", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>Credentials</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                                API Key
                            </label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWarningModal({ type: "api", isOpen: true })}
                                disabled={rollingApiKey || rollingJwt}
                                className="h-7 text-xs"
                            >
                                {rollingApiKey ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                                Roll API Key
                            </Button>
                        </div>
                        <div className="relative">
                            <Input
                                value={showKey['api'] ? (project.apiKey || "") : maskKey(project.apiKey || "")}
                                readOnly
                                className="pr-20 font-mono text-xs"
                            />
                            <div className="absolute right-1 top-1 flex items-center gap-1">
                                <button
                                    onClick={() => setShowKey({ ...showKey, api: !showKey.api })}
                                    className={cn("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700")}
                                >
                                    {showKey['api'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button
                                    onClick={() => copyKey(project.apiKey || "", 'api')}
                                    className={cn("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700")}
                                >
                                    {copiedKey === 'api' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                                JWT Secrets
                            </label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWarningModal({ type: "jwt", isOpen: true })}
                                disabled={rollingApiKey || rollingJwt}
                                className="h-7 text-xs"
                            >
                                {rollingJwt ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                                Roll JWT Secrets
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-gray-400" : "text-gray-500")}>
                                    Private Key (Ed25519)
                                </label>
                                <div className="relative">
                                    <Input
                                        value={showKey['private'] ? (project.privateKey || "") : maskKey(project.privateKey || "")}
                                        readOnly
                                        className="pr-20 font-mono text-xs"
                                    />
                                    <div className="absolute right-1 top-1 flex items-center gap-1">
                                        <button
                                            onClick={() => setShowKey({ ...showKey, private: !showKey.private })}
                                            className={cn("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700")}
                                        >
                                            {showKey['private'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={() => copyKey(project.privateKey || "", 'private')}
                                            className={cn("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700")}
                                        >
                                            {copiedKey === 'private' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-gray-400" : "text-gray-500")}>
                                    Public Key
                                </label>
                                <div className="relative">
                                    <Input
                                        value={showKey['public'] ? (project.publicKey || "") : maskKey(project.publicKey || "")}
                                        readOnly
                                        className="pr-20 font-mono text-xs"
                                    />
                                    <div className="absolute right-1 top-1 flex items-center gap-1">
                                        <button
                                            onClick={() => setShowKey({ ...showKey, public: !showKey.public })}
                                            className={cn("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700")}
                                        >
                                            {showKey['public'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={() => copyKey(project.publicKey || "", 'public')}
                                            className={cn("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700")}
                                        >
                                            {copiedKey === 'public' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Requests"
                    value={stats?.totalRequests.toLocaleString() || "0"}
                    change={stats?.requestsTrend}
                    icon={<Activity className="w-4 h-4" />}
                    isDark={isDark}
                />
                <StatCard
                    title="Active Sessions"
                    value={stats?.activeSessions.toLocaleString() || "0"}
                    icon={<Users className="w-4 h-4" />}
                    isDark={isDark}
                />
                <StatCard
                    title="Protocol Breaches"
                    value={stats?.breaches.toLocaleString() || "0"}
                    icon={<ShieldAlert className="w-4 h-4 text-red-500" />}
                    isDark={isDark}
                />
                <StatCard
                    title="Tokens Used"
                    value={stats?.totalTokens.toLocaleString() || "0"}
                    change={stats?.tokensTrend}
                    icon={<Coins className="w-4 h-4" />}
                    isDark={isDark}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Traffic & Security */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Traffic Chart */}
                    <div className={cn("p-6 rounded-xl border", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>API Traffic</h3>
                            <select className={cn("text-sm border rounded-lg px-2 py-1", isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200")}>
                                <option>Last 7 Days</option>
                                <option>Last 24 Hours</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <TrafficChart data={trafficData} />
                    </div>

                    {/* Security Events */}
                    <div className={cn("p-6 rounded-xl border", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>Recent Security Events</h3>
                            <Button variant="outline" size="sm">View All</Button>
                        </div>
                        <SecurityEventsTable events={securityEvents} isDark={isDark} />
                    </div>
                </div>

                {/* Right Column - New Charts & Key Management */}
                <div className="space-y-8">
                    {/* New Charts Grid (Mobile/Tablet stacks, here vertical in sidebar) */}
                    <div className="grid grid-cols-1 gap-4">
                        <TokenUsageChart data={tokenData} />
                    </div>
                </div>
            </div>

            {/* Warning Modal */}
            <RollKeyWarningModal
                isOpen={warningModal.isOpen}
                onClose={() => setWarningModal({ type: warningModal.type, isOpen: false })}
                onConfirm={warningModal.type === "api" ? handleRollApiKey : handleRollJwtSecrets}
                keyType={warningModal.type}
                isRolling={rollingApiKey || rollingJwt}
            />
        </div >
    );
}
