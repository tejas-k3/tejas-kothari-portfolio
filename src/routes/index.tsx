import { createFileRoute } from "@tanstack/react-router";
import { MetroGrid } from "@/components/MetroGrid";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tejas Kothari — Software Engineer" },
      { name: "description", content: "Backend engineer who likes distributed systems, clean APIs, and shipping things that don't wake people up at 3am." },
      { property: "og:title", content: "Tejas Kothari — Software Engineer" },
      { property: "og:description", content: "Portfolio of Tejas Kothari — backend engineer working on distributed systems and blockchain integrations." },
    ],
  }),
});

function Index() {
  return <MetroGrid />;
}
