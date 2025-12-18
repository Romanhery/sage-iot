

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <h1><a href="/login">Login</a></h1>
        <h1><a href="/sign-up">Sign Up</a></h1>
      </div>
    </main>
  );
}
