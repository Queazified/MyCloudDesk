import { redirect } from "next/navigation";
import { LoginButtons } from "@/components/login-buttons";
import { getLoginProviders } from "@/lib/auth";
import { getOptionalUser } from "@/lib/authorization";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default async function LoginPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  const providers = getLoginProviders();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl lg:grid-cols-[1fr,0.9fr] lg:p-10">
        <section className="rounded-[1.5rem] bg-slate-950 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Queazified</p>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">{APP_TAGLINE}</p>
          <div className="mt-10 space-y-4 text-sm text-slate-300">
            <p>• See which cloud PCs are available right now.</p>
            <p>• Connect to an available cloud desktop in just a few clicks.</p>
            <p>• View your recent usage without booking or reservation steps.</p>
          </div>
        </section>

        <section className="flex flex-col justify-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Access your cloud desktop</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use Queazified single sign-on to view live cloud PC availability and connect to an available desktop.
            </p>
          </div>
          <div className="mt-8">
            <LoginButtons providers={providers} />
          </div>
          <p className="mt-6 text-xs text-slate-400">
            No bookings or reservations are used in MyCloudDesk. You simply sign in, choose an available cloud PC, and connect.
          </p>
        </section>
      </div>
    </main>
  );
}
