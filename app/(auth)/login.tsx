/**
 * Renders the login route for the auth flow.
 */

import { AuthScreen } from '@/features/auth/components';

export default function LoginRoute() {
  return (
    <AuthScreen
      title="Log in"
      description="Authenticate with Supabase here once the auth form and service layer are wired in."
    />
  );
}
