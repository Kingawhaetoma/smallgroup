import { SignIn } from "@clerk/nextjs";
import { ClerkAuthBoundary } from "@/components/clerk-auth-boundary";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <ClerkAuthBoundary>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </ClerkAuthBoundary>
    </div>
  );
}
