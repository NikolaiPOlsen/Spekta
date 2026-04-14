/**
 * Redirects the root route into the main tab navigator.
 */

import { Redirect } from "expo-router";
const app = () => {
  return (
    <Redirect href="/(auth)/start" />
  );
}

export default app;
