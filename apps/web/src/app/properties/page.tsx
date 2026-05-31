import { redirect } from "next/navigation";

// /properties just redirects to /search — this is the canonical search URL
export default function PropertiesPage() {
  redirect("/search");
}
