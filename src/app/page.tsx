import Link from "next/link";

// TODO: Add a landing page that will send the user to the dashboard with CTA
export default async function Home() {
  return (
    <div className="">
      <Link href={"/dashboard"}>Go to dashboard</Link>
    </div>
  );
}
