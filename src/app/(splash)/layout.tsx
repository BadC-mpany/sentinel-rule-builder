import React from "react";

export const metadata = {
    title: "Sentinel Framework | Security for Agentic Systems",
    description: "Security framework for agentic systems by BadCompany",
};

export default function SplashLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}
