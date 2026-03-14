import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Track every rep.
          <br />
          <span className="text-gray-500">See every gain.</span>
        </h1>
        <p className="max-w-xl text-lg text-gray-600">
          Lifting Diary helps you log workouts, monitor progress, and stay
          consistent — all in one place.
        </p>
        <div className="flex gap-3 mt-2">
          <SignUpButton mode="modal">
            <Button size="lg">Get started free</Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-10">
            Everything you need to level up
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Log Workouts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Record sets, reps, and weights for every exercise. Fast and
                simple entry so you never miss a session.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Track Progress</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                See your personal records and trends over time. Know exactly
                when you hit a new PR.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review History</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Browse past workouts by date. Use your history to plan smarter
                and train harder.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Ready to start lifting smarter?
        </h2>
        <SignUpButton mode="modal">
          <Button size="lg">Create your free account</Button>
        </SignUpButton>
      </section>
    </div>
  );
}
