/**
 * Renders the signup route for the auth flow.
 */

import { AuthScreen } from '@/features/auth/components';

export default function SignupRoute() {
  return (
    <AuthScreen
      title="Create account"
      description="Register new users here once the auth form and Supabase service are implemented."
    />
  );
}
