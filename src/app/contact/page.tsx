"use client";

import React, { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import { Mail, User, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-bg-primary p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Info */}
        <div className="space-y-8 pt-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-4">
              Let's Talk Security
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Have questions about securing your AI agents? We're here to help you build the future safely.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center border border-border-primary group-hover:border-primary group-hover:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Contact Person</p>
                <p className="text-lg font-bold">Janos Mozer</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center border border-border-primary group-hover:border-primary group-hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Email Address</p>
                <a href="mailto:contact@badcompany.xyz" className="text-lg font-bold hover:text-primary transition-colors">
                  contact@badcompany.xyz
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar Action */}
        <div className="bg-bg-secondary rounded-xl p-8 border border-border-primary shadow-2xl shadow-primary/5 self-end">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
            <Calendar className="w-7 h-7" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Book a meeting</h2>
          <p className="text-text-secondary mb-8">
            Book a 30-minute call directly with our team to discuss your specific needs and how Sentinel can fit into your architecture.
          </p>

          <Button
            data-cal-namespace="30min"
            data-cal-link="janos-mozer/30min"
            data-cal-config='{"layout":"month_view","theme":"auto"}'
            variant="default"
            className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Book 30-min Call <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

      </div>
    </div>
  );
}
