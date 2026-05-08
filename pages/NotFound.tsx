import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted-foreground">页面不存在，可能已经被移动。</p>
        <Link href="/" className="underline">
          返回首页
        </Link>
      </div>
    </main>
  );
}
