/**
 * Redirects the root route into the main tab navigator.
 */

import { Redirect } from 'expo-router';

export default function IndexRoute() {
  return <Redirect href="/tabs/home" />;
}
