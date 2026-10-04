"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const sections = [
  {
    title: "Quick Links",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/cookies", label: "Cookie policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container-wide py-10">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <span>NutriMed <span className="text-primary">Ethiopia</span></span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Doctor-led digital nutrition and lifestyle medicine. Evidence-based,
              personalized, available in Ethiopia and abroad.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Addis Ababa, Ethiopia
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:jerusalemelias176@gmail.com">jerusalemelias176@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+251901047276">+251 901047276</a>
              </li>
            </ul>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NutriMed Ethiopia. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Medical disclaimer: information on this site is educational and does not
            replace individualized medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}