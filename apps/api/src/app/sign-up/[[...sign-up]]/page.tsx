import { SignUp } from "@clerk/nextjs";
import { ClerkAuthBoundary } from "@/components/clerk-auth-boundary";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <ClerkAuthBoundary>
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </ClerkAuthBoundary>
    </div>
  );
}
