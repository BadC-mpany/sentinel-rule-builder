"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Shield, Zap, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto bg-bg-primary text-text-primary font-[var(--font-inter)] selection:bg-primary/20">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-8 animate-fade-in border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Security Framework for AI Agents
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold font-[var(--font-display)] tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-text-primary to-text-secondary animate-slide-in">
            Sentinel
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-in" style={{ animationDelay: "0.1s" }}>
            The missing security layer for modern AI. <span className="text-primary font-semibold">badcompany</span> framework for making agents secure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in" style={{ animationDelay: "0.2s" }}>
            <Link href="/docs#getting-started">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1">
                Get Started in 10 min <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <button className="h-14 px-8 text-lg font-medium text-text-primary hover:bg-bg-secondary rounded-full transition-colors border border-border-primary">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 px-6 bg-bg-secondary/50 border-y border-border-primary">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mb-6">
                We've jailbroken every state-of-the-art LLM.
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                AI agents now have authority over bank accounts, payment rails, and financial operations. We're building the security industry forgot.
              </p>
              <ul className="space-y-4">
                {[
                  "Prevent unauthorized data exfiltration",
                  "Block malicious code execution",
                  "Enforce strict tool-use policies"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-text-primary font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Visual Representation */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20" />
              <div className="relative bg-bg-primary border border-border-primary rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-primary">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <span className="font-semibold">Security Policy</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                </div>
                
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg border border-border-primary">
                    <span className="text-text-secondary">read_database</span>
                    <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs">ALLOW</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                    <span className="text-text-secondary">execute_python</span>
                    <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs">DENY</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg border border-border-primary">
                    <span className="text-text-secondary">send_email</span>
                    <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs">HUMAN_VERIFY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-[var(--font-display)] mb-4">Everything you need to secure agents</h2>
            <p className="text-text-secondary">Comprehensive tools for the next generation of AI.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Taint Analysis",
                desc: "Track sensitive data flow through your agent's tool calls."
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "Policy Engine",
                desc: "Define granular allow/deny lists for tool execution."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Low Latency",
                desc: "Optimized for real-time agent interactions with minimal overhead."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-bg-primary border border-border-primary hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center text-text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
