import getDiscoverApiRequestUrlParametersFromWeights from "../get-discover-url-parameters.ts";
import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

Deno.test("calculateTotal computes sum correctly", () => {
	const items = [
		{ price: 10, qty: 2 },
		{ price: 5, qty: 3 },
	];

	const result = calculateTotal(items);

	assertEquals(result, 10 * 2 + 5 * 3); // 20 + 15 = 35
});